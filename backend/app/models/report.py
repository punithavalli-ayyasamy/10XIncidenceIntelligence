"""Unified Incident Intelligence Report and shared pipeline context."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field

from app.agents.detection_agent import DetectionResult
from app.agents.investigation_agent import InvestigationFinding
from app.models.incident import Incident


class ReportStatus(str, Enum):
    """High-level outcome of the orchestration pipeline."""

    NO_INCIDENT = "no_incident"
    INCIDENT_DETECTED = "incident_detected"
    INCIDENT_INVESTIGATED = "incident_investigated"
    PARTIAL = "partial"


class AgentStepTrace(BaseModel):
    """Record of one pipeline step execution."""

    agent: str
    status: str = Field(description="ran | skipped | stopped_pipeline")
    reason: str | None = None
    output_keys: list[str] = Field(default_factory=list)


class IncidentIntelligenceReport(BaseModel):
    """
    Single consolidated report returned by the orchestration service.

    Designed so future agents (dependency, impact, prediction, recommendation)
    can add fields without breaking the envelope.
    """

    report_id: str
    status: ReportStatus
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    service: str | None = None

    # Core artifacts
    incident: Incident | None = None
    detection: DetectionResult | None = None
    investigation: InvestigationFinding | None = None

    # Human-readable rollup
    summary: str
    severity: str | None = None
    root_cause: str | None = None
    confidence: float | int | None = None
    supporting_evidence: list[str] = Field(default_factory=list)
    affected_services: list[str] = Field(default_factory=list)

    # Pipeline metadata (extensibility)
    pipeline: list[str] = Field(
        default_factory=list,
        description="Ordered agent names configured for this run.",
    )
    agents_run: list[str] = Field(default_factory=list)
    step_traces: list[AgentStepTrace] = Field(default_factory=list)
    next_agent: str | None = None
    agent_outputs: dict[str, Any] = Field(
        default_factory=dict,
        description="Raw per-agent outputs for downstream consumers / debugging.",
    )
    # Reserved for DependencyAgent, ImpactAgent, PredictionAgent, RecommendationAgent
    extras: dict[str, Any] = Field(default_factory=dict)


class PipelineContext(BaseModel):
    """
    Shared mutable state passed through the agent pipeline.

    Each agent receives this context (including previous agents' outputs)
    and returns updates that are merged back in.
    """

    model_config = {"arbitrary_types_allowed": True}

    service: str | None = None
    metrics: dict[str, Any] | None = None
    incident_id: str | None = None

    detection: DetectionResult | None = None
    investigation: InvestigationFinding | None = None
    incident: Incident | None = None

    # Accumulated outputs keyed by agent name — previous agent output for the next step
    agent_outputs: dict[str, Any] = Field(default_factory=dict)
    step_traces: list[AgentStepTrace] = Field(default_factory=list)
    agents_run: list[str] = Field(default_factory=list)

    stopped: bool = False
    stop_reason: str | None = None
    next_agent: str | None = None
    extras: dict[str, Any] = Field(default_factory=dict)

    def previous_output(self, agent_name: str) -> Any | None:
        """Fetch a prior agent's output by name."""
        return self.agent_outputs.get(agent_name)

    def last_agent_output(self) -> Any | None:
        """Output of the most recently run agent, if any."""
        if not self.agents_run:
            return None
        return self.agent_outputs.get(self.agents_run[-1])
