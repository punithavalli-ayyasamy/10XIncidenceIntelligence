"""
Incident investigation orchestrator.

Coordinates detection → investigation → dependency → impact → prediction → recommendation.
"""

from __future__ import annotations

from typing import Any

from app.agents.dependency_agent import DependencyAgent
from app.agents.detection_agent import DetectionAgent, DetectionResult
from app.agents.impact_agent import ImpactAgent
from app.agents.investigation_agent import InvestigationAgent
from app.agents.prediction_agent import PredictionAgent
from app.agents.recommendation_agent import RecommendationAgent
from app.models.incident import Incident, InvestigationResult
from app.services.llm_service import LLMService, create_llm_service


class IncidentOrchestrator:
    """Multi-agent pipeline coordinator."""

    def __init__(self, llm: LLMService | None = None) -> None:
        self.llm = llm or create_llm_service()
        self.detection = DetectionAgent(llm=self.llm)
        self.investigation = InvestigationAgent(llm=self.llm)
        self.dependency = DependencyAgent(llm=self.llm)
        self.impact = ImpactAgent(llm=self.llm)
        self.prediction = PredictionAgent(llm=self.llm)
        self.recommendation = RecommendationAgent(llm=self.llm)
        # In-memory store for hackathon (no database)
        self._incidents: dict[str, Incident] = {}
        self._detections: dict[str, DetectionResult] = {}

    async def detect(
        self,
        service: str | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Run DetectionAgent only and optionally persist the incident."""
        context: dict[str, Any] = {"service": service, **kwargs}
        partial = await self.detection.run(context)
        detection_raw = partial.get("detection") or {}
        detection = DetectionResult.model_validate(detection_raw)
        incident = partial.get("incident")
        if isinstance(incident, Incident):
            self._incidents[incident.id] = incident
            self._detections[incident.id] = detection
        return {
            "detection": detection,
            "incident": incident,
            "next_agent": detection.next_agent,
        }

    async def run(
        self,
        incident_id: str | None = None,
        service: str | None = None,
        **kwargs: Any,
    ) -> InvestigationResult | None:
        """
        Execute the investigation pipeline.

        Currently runs DetectionAgent; remaining agents are wired later.
        """
        detect_out = await self.detect(service=service, **kwargs)
        incident = detect_out.get("incident")
        detection: DetectionResult = detect_out["detection"]

        if not detection.incident_created or not isinstance(incident, Incident):
            return None

        # TODO: Continue with investigation / dependency / impact / prediction / recommendation
        # context.update(await self.investigation.run(context))
        _ = incident_id
        return InvestigationResult(
            incident_id=incident.id,
            agent_traces={"detection": detection.model_dump()},
        )

    def get_incident(self, incident_id: str) -> Incident | None:
        return self._incidents.get(incident_id)

    def list_incidents(self) -> list[Incident]:
        return list(self._incidents.values())
