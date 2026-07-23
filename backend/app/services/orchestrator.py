"""
Incident investigation orchestrator.

Coordinates detection → investigation → dependency → impact → prediction → recommendation.

LangGraph is optional: keep a simple sequential runner first; swap in a StateGraph later.
"""

from typing import Any

from app.agents.dependency_agent import DependencyAgent
from app.agents.detection_agent import DetectionAgent
from app.agents.impact_agent import ImpactAgent
from app.agents.investigation_agent import InvestigationAgent
from app.agents.prediction_agent import PredictionAgent
from app.agents.recommendation_agent import RecommendationAgent
from app.models.incident import InvestigationResult


class IncidentOrchestrator:
    """
    Multi-agent pipeline coordinator.

    TODO: Define shared state schema (dict or Pydantic) passed between agents.
    TODO: Optionally compile a LangGraph StateGraph with the same agent nodes.
    TODO: Persist results in-memory for GET /incidents/{id} (no database).
    """

    def __init__(self) -> None:
        # TODO: Inject LLMClient / GeminiLLMClient and shared tools.
        self.detection = DetectionAgent()
        self.investigation = InvestigationAgent()
        self.dependency = DependencyAgent()
        self.impact = ImpactAgent()
        self.prediction = PredictionAgent()
        self.recommendation = RecommendationAgent()

    async def run(
        self,
        incident_id: str | None = None,
        service: str | None = None,
        **kwargs: Any,
    ) -> InvestigationResult | None:
        """
        Execute the full investigation pipeline.

        Returns InvestigationResult when implemented; None while skeleton-only.
        """
        context: dict[str, Any] = {
            "incident_id": incident_id,
            "service": service,
            **kwargs,
        }

        # TODO: Sequential agent chain (or LangGraph invoke).
        # context.update(await self.detection.run(context))
        # context.update(await self.investigation.run(context))
        # context.update(await self.dependency.run(context))
        # context.update(await self.impact.run(context))
        # context.update(await self.prediction.run(context))
        # context.update(await self.recommendation.run(context))
        # return InvestigationResult(...)

        _ = context
        return None

    # TODO: def build_langgraph(self) -> CompiledGraph: ...
