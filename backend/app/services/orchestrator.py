"""
Extensible AI orchestration pipeline.

Flow:
  metrics → DetectionAgent → (if incident_created) → InvestigationAgent → Report

Additional agents register as PipelineStep instances without changing the runner.
"""

from __future__ import annotations

import logging
import uuid
from abc import ABC, abstractmethod
from typing import Any, Callable, Awaitable

from app.agents.detection_agent import DetectionAgent, DetectionResult
from app.agents.investigation_agent import InvestigationAgent, InvestigationFinding
from app.models.incident import Incident
from app.models.report import (
    AgentStepTrace,
    IncidentIntelligenceReport,
    PipelineContext,
    ReportStatus,
)
from app.services.llm_service import LLMService, create_llm_service
from app.tools.metrics_tool import MetricsTool
from app.core.observability import span

logger = logging.getLogger(__name__)


class PipelineStep(ABC):
    """
    One stage in the orchestration pipeline.

    Implement `should_run` for gating (e.g. only after incident_created)
    and `execute` to consume PipelineContext (including previous agent output).
    """

    name: str

    @abstractmethod
    async def should_run(self, ctx: PipelineContext) -> tuple[bool, str | None]:
        """Return (True, None) to run, or (False, reason) to skip."""

    @abstractmethod
    async def execute(self, ctx: PipelineContext) -> PipelineContext:
        """
        Run the agent. Must merge results into ctx.agent_outputs[self.name]
        and set domain fields (detection, investigation, …) as needed.
        """


class DetectionStep(PipelineStep):
    """metrics → DetectionAgent."""

    name = "DetectionAgent"

    def __init__(self, agent: DetectionAgent) -> None:
        self.agent = agent

    async def should_run(self, ctx: PipelineContext) -> tuple[bool, str | None]:
        return True, None

    async def execute(self, ctx: PipelineContext) -> PipelineContext:
        with span("agent.DetectionAgent", service=ctx.service or ""):
            partial = await self.agent.run(
                {
                    "service": ctx.service,
                    "metrics": ctx.metrics,
                    "previous_output": ctx.last_agent_output(),
                    "agent_outputs": ctx.agent_outputs,
                }
            )
            detection = DetectionResult.model_validate(partial.get("detection") or {})
            incident = partial.get("incident")

            ctx.detection = detection
            ctx.incident = incident if isinstance(incident, Incident) else None
            ctx.next_agent = detection.next_agent
            ctx.agent_outputs[self.name] = {
                "detection": detection.model_dump(),
                "incident": ctx.incident.model_dump() if ctx.incident else None,
                "next_agent": detection.next_agent,
            }
            ctx.agents_run.append(self.name)

            if not detection.incident_created:
                ctx.stopped = True
                ctx.stop_reason = "DetectionAgent did not create an incident"
                ctx.next_agent = None

            logger.info(
                "DetectionAgent done incident_created=%s severity=%s confidence=%s",
                detection.incident_created,
                detection.severity,
                detection.confidence,
            )
            return ctx


class InvestigationStep(PipelineStep):
    """DetectionAgent output → InvestigationAgent (only if incident_created)."""

    name = "InvestigationAgent"

    def __init__(self, agent: InvestigationAgent) -> None:
        self.agent = agent

    async def should_run(self, ctx: PipelineContext) -> tuple[bool, str | None]:
        if ctx.stopped:
            return False, ctx.stop_reason or "pipeline already stopped"
        if ctx.detection is None:
            return False, "no detection output available"
        if not ctx.detection.incident_created:
            return False, "incident_created == false"
        if ctx.incident is None:
            return False, "no incident record to investigate"
        return True, None

    async def execute(self, ctx: PipelineContext) -> PipelineContext:
        with span(
            "agent.InvestigationAgent",
            service=ctx.service or "",
            incident_id=ctx.incident.id if ctx.incident else "",
        ):
            # Pass previous agent output explicitly
            previous = ctx.previous_output("DetectionAgent") or {
                "detection": ctx.detection.model_dump() if ctx.detection else None,
                "incident": ctx.incident.model_dump() if ctx.incident else None,
            }
            partial = await self.agent.run(
                {
                    "service": ctx.service
                    or (ctx.detection.affected_service if ctx.detection else None),
                    "detection": ctx.detection,
                    "incident": ctx.incident,
                    "metrics": ctx.metrics,
                    "previous_output": previous,
                    "agent_outputs": ctx.agent_outputs,
                }
            )
            finding = InvestigationFinding.model_validate(partial.get("investigation") or {})
            incident = partial.get("incident")
            if isinstance(incident, Incident):
                ctx.incident = incident

            ctx.investigation = finding
            ctx.next_agent = str(partial.get("next_agent") or "DependencyAgent")
            ctx.agent_outputs[self.name] = {
                "investigation": finding.model_dump(),
                "incident": ctx.incident.model_dump() if ctx.incident else None,
                "next_agent": ctx.next_agent,
            }
            ctx.agents_run.append(self.name)
            logger.info(
                "InvestigationAgent done confidence=%s root_cause_len=%s",
                finding.confidence,
                len(finding.root_cause or ""),
            )
            return ctx


class FunctionStep(PipelineStep):
    """
    Lightweight adapter for future agents without a full PipelineStep class.

    Example:
        FunctionStep("DependencyAgent", should_fn, execute_fn)
    """

    def __init__(
        self,
        name: str,
        should_fn: Callable[[PipelineContext], Awaitable[tuple[bool, str | None]]],
        execute_fn: Callable[[PipelineContext], Awaitable[PipelineContext]],
    ) -> None:
        self.name = name
        self._should_fn = should_fn
        self._execute_fn = execute_fn

    async def should_run(self, ctx: PipelineContext) -> tuple[bool, str | None]:
        return await self._should_fn(ctx)

    async def execute(self, ctx: PipelineContext) -> PipelineContext:
        return await self._execute_fn(ctx)


class OrchestrationService:
    """
    AI orchestration service.

    Pipeline (default):
      Receive metrics → DetectionAgent → [if incident_created] InvestigationAgent
      → Incident Intelligence Report

    Extensibility:
      service.add_step(DependencyStep(...), after="InvestigationAgent")
    """

    def __init__(
        self,
        llm: LLMService | None = None,
        steps: list[PipelineStep] | None = None,
        metrics_tool: MetricsTool | None = None,
    ) -> None:
        self.llm = llm or create_llm_service()
        self.metrics_tool = metrics_tool or MetricsTool()
        self.detection_agent = DetectionAgent(llm=self.llm, metrics_tool=self.metrics_tool)
        self.investigation_agent = InvestigationAgent(llm=self.llm, metrics_tool=self.metrics_tool)

        self.steps: list[PipelineStep] = steps or [
            DetectionStep(self.detection_agent),
            InvestigationStep(self.investigation_agent),
        ]

        # In-memory report/incident store (no database)
        self._reports: dict[str, IncidentIntelligenceReport] = {}
        self._incidents: dict[str, Incident] = {}

    @property
    def pipeline_names(self) -> list[str]:
        return [step.name for step in self.steps]

    def add_step(self, step: PipelineStep, *, after: str | None = None) -> None:
        """
        Register an additional agent step.

        If `after` is set, insert immediately after that agent name; else append.
        """
        if after is None:
            self.steps.append(step)
            return
        for i, existing in enumerate(self.steps):
            if existing.name == after:
                self.steps.insert(i + 1, step)
                return
        raise ValueError(f"No pipeline step named '{after}' to insert after")

    def remove_step(self, name: str) -> None:
        self.steps = [s for s in self.steps if s.name != name]

    async def run(
        self,
        *,
        service: str | None = "payment-service",
        metrics: dict[str, Any] | None = None,
        incident_id: str | None = None,
        **kwargs: Any,
    ) -> IncidentIntelligenceReport:
        """
        Execute the full pipeline and return one Incident Intelligence Report.

        Loads payment_metrics.json when metrics are not provided.
        """
        _ = kwargs
        with span(
            "orchestration.run",
            service=service or "payment-service",
            incident_id=incident_id or "",
        ):
            if metrics is None:
                with span("tools.metrics.load", filename="payment_metrics.json"):
                    metrics = await self.metrics_tool.load_raw("payment_metrics.json")

            ctx = PipelineContext(
                service=service or str(metrics.get("service") or "payment-service"),
                metrics=metrics,
                incident_id=incident_id,
                extras=dict(kwargs) if kwargs else {},
            )

            logger.info(
                "Orchestration starting pipeline=%s service=%s",
                self.pipeline_names,
                ctx.service,
            )

            for step in self.steps:
                if ctx.stopped:
                    ctx.step_traces.append(
                        AgentStepTrace(
                            agent=step.name,
                            status="stopped_pipeline",
                            reason=ctx.stop_reason,
                        )
                    )
                    continue

                should, reason = await step.should_run(ctx)
                if not should:
                    ctx.step_traces.append(
                        AgentStepTrace(agent=step.name, status="skipped", reason=reason)
                    )
                    logger.info("Skipping %s (%s)", step.name, reason)
                    continue

                logger.info(
                    "Running %s (previous=%s)",
                    step.name,
                    ctx.agents_run[-1] if ctx.agents_run else None,
                )
                with span(f"pipeline.step.{step.name}", agent=step.name):
                    ctx = await step.execute(ctx)
                output = ctx.agent_outputs.get(step.name) or {}
                ctx.step_traces.append(
                    AgentStepTrace(
                        agent=step.name,
                        status="ran",
                        output_keys=list(output.keys()) if isinstance(output, dict) else [],
                    )
                )

            report = self._build_report(ctx)
            self._reports[report.report_id] = report
            if report.incident is not None:
                self._incidents[report.incident.id] = report.incident
            logger.info(
                "Orchestration complete report_id=%s status=%s agents_run=%s",
                report.report_id,
                report.status,
                report.agents_run,
            )
            return report

    def _build_report(self, ctx: PipelineContext) -> IncidentIntelligenceReport:
        report_id = f"rpt-{uuid.uuid4().hex[:10]}"

        if ctx.detection is None:
            status = ReportStatus.PARTIAL
            summary = "Pipeline finished without detection output."
        elif not ctx.detection.incident_created:
            status = ReportStatus.NO_INCIDENT
            summary = ctx.detection.summary or "No incident created from metrics."
        elif ctx.investigation is not None:
            status = ReportStatus.INCIDENT_INVESTIGATED
            summary = (
                f"Incident on {ctx.detection.affected_service}: "
                f"{ctx.investigation.root_cause}"
            )
        else:
            status = ReportStatus.INCIDENT_DETECTED
            summary = ctx.detection.summary or "Incident detected; investigation not completed."

        return IncidentIntelligenceReport(
            report_id=report_id,
            status=status,
            service=ctx.service,
            incident=ctx.incident,
            detection=ctx.detection,
            investigation=ctx.investigation,
            summary=summary,
            severity=ctx.detection.severity if ctx.detection else None,
            root_cause=ctx.investigation.root_cause if ctx.investigation else None,
            confidence=(
                ctx.investigation.confidence
                if ctx.investigation
                else (ctx.detection.confidence if ctx.detection else None)
            ),
            supporting_evidence=(
                list(ctx.investigation.supporting_evidence) if ctx.investigation else []
            ),
            affected_services=(
                list(ctx.investigation.affected_services)
                if ctx.investigation
                else (
                    [ctx.detection.affected_service]
                    if ctx.detection and ctx.detection.incident_created
                    else []
                )
            ),
            pipeline=self.pipeline_names,
            agents_run=list(ctx.agents_run),
            step_traces=list(ctx.step_traces),
            next_agent=ctx.next_agent,
            agent_outputs=dict(ctx.agent_outputs),
            extras=dict(ctx.extras),
        )

    # ---- convenience / store accessors ----

    async def detect_only(
        self,
        *,
        service: str | None = "payment-service",
        metrics: dict[str, Any] | None = None,
    ) -> IncidentIntelligenceReport:
        """Run only DetectionAgent (temporary single-step pipeline)."""
        original = self.steps
        self.steps = [DetectionStep(self.detection_agent)]
        try:
            return await self.run(service=service, metrics=metrics)
        finally:
            self.steps = original

    def get_report(self, report_id: str) -> IncidentIntelligenceReport | None:
        return self._reports.get(report_id)

    def get_incident(self, incident_id: str) -> Incident | None:
        return self._incidents.get(incident_id)

    def list_incidents(self) -> list[Incident]:
        return list(self._incidents.values())

    def list_reports(self) -> list[IncidentIntelligenceReport]:
        return list(self._reports.values())


# Backward-compatible alias used by existing imports
IncidentOrchestrator = OrchestrationService
