"""Detection agent — multi-metric incident detection via LLMService."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

from app.agents import BaseAgent
from app.models.incident import Incident, IncidentSeverity, IncidentStatus
from app.services.llm_service import LLMService, create_llm_service
from app.tools.metrics_tool import MetricsTool

_PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"


class DetectionResult(BaseModel):
    """Structured detection output consumed by the orchestrator / API."""

    incident_created: bool
    severity: str
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str
    summary: str
    affected_service: str
    next_agent: str = "InvestigationAgent"


class DetectionAgent(BaseAgent):
    """
    Senior-SRE style detection agent.

    Loads payment_metrics.json via MetricsTool and asks LLMService to reason over
    multiple metrics together (no hardcoded absolute thresholds in the agent).
    """

    name = "detection_agent"

    def __init__(
        self,
        llm: LLMService | None = None,
        metrics_tool: MetricsTool | None = None,
        metrics_filename: str = "payment_metrics.json",
    ) -> None:
        super().__init__(llm=llm)
        self.llm_service: LLMService = llm or create_llm_service()
        self.metrics_tool = metrics_tool or MetricsTool()
        self.metrics_filename = metrics_filename
        self._system_prompt = self._load_prompt()

    def _load_prompt(self) -> str:
        path = _PROMPTS_DIR / "detection_prompt.txt"
        if path.exists():
            return path.read_text(encoding="utf-8").strip()
        return (
            "You are a senior SRE. Analyze metrics and decide if an incident "
            "should be created. Return only JSON."
        )

    async def analyze(
        self,
        service: str | None = None,
        metrics_payload: dict[str, Any] | None = None,
    ) -> DetectionResult:
        """
        Analyze metrics and return structured detection JSON.

        Prefer calling this from the API/orchestrator; `run()` wraps it for the pipeline.
        """
        if metrics_payload is None:
            metrics_payload = await self.metrics_tool.load_raw(self.metrics_filename)

        affected = (
            service
            or str(metrics_payload.get("service") or "payment-service")
        )

        # Compact but complete context for the model
        analysis_payload = {
            "service": metrics_payload.get("service", affected),
            "scenario": metrics_payload.get("scenario"),
            "window": metrics_payload.get("window"),
            "baselines_described": metrics_payload.get("baselines"),
            "incident_signals_metadata": metrics_payload.get("incident_signals"),
            "timeline": metrics_payload.get("timeline", []),
        }

        user_prompt = (
            f"{self._system_prompt}\n\n"
            f"Affected service hint: {affected}\n\n"
            "Analyze the following metrics document. Reason across the full timeline.\n\n"
            f"METRICS_JSON:\n{json.dumps(analysis_payload, indent=2)}"
        )

        raw = await self.llm_service.generate_json(user_prompt)
        result = self._normalize(raw, default_service=affected)
        return result

    def _normalize(self, raw: dict[str, Any], default_service: str) -> DetectionResult:
        """Validate / coerce LLM output into DetectionResult."""
        severity = str(raw.get("severity", "medium")).lower().strip()
        if severity not in {"low", "medium", "high", "critical"}:
            severity = "medium"

        confidence = raw.get("confidence", 0.5)
        try:
            confidence_f = float(confidence)
        except (TypeError, ValueError):
            confidence_f = 0.5
        confidence_f = max(0.0, min(1.0, confidence_f))

        incident_created = bool(raw.get("incident_created", False))
        next_agent = str(raw.get("next_agent") or "InvestigationAgent")

        return DetectionResult(
            incident_created=incident_created,
            severity=severity,
            confidence=confidence_f,
            reason=str(raw.get("reason") or "No reason provided by model."),
            summary=str(raw.get("summary") or "No summary provided by model."),
            affected_service=str(raw.get("affected_service") or default_service),
            next_agent=next_agent,
        )

    def to_incident(self, detection: DetectionResult) -> Incident | None:
        """Map a positive detection into an Incident record."""
        if not detection.incident_created:
            return None

        severity = IncidentSeverity(detection.severity)
        return Incident(
            id=f"inc-{uuid.uuid4().hex[:10]}",
            title=f"Degradation detected on {detection.affected_service}",
            service=detection.affected_service,
            severity=severity,
            status=IncidentStatus.DETECTED,
            detected_at=datetime.now(timezone.utc),
            description=detection.summary,
            metadata={
                "reason": detection.reason,
                "confidence": detection.confidence,
                "next_agent": detection.next_agent,
                "source": "DetectionAgent",
                "metrics_file": self.metrics_filename,
            },
        )

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        """Pipeline step: detect → optional Incident → hand off to InvestigationAgent."""
        service = context.get("service")
        metrics_payload = context.get("metrics")
        detection = await self.analyze(
            service=service if isinstance(service, str) else None,
            metrics_payload=metrics_payload if isinstance(metrics_payload, dict) else None,
        )
        incident = self.to_incident(detection)
        return {
            "agent": self.name,
            "detection": detection.model_dump(),
            "incident": incident,
            "next_agent": detection.next_agent,
        }
