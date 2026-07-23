"""Impact agent — business impact estimation."""

from typing import Any

from app.agents import BaseAgent
from app.models.incident import BusinessImpact


class ImpactAgent(BaseAgent):
    """
    Estimates business impact from traffic, severity, and dependency blast radius.

    TODO: Use TrafficTool and dependency output to estimate affected users / $ loss.
    TODO: Align impact schema with BusinessImpact model.
    """

    name = "impact_agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        """
        Expected context keys (TBD): incident, blast_radius, traffic.

        Returns partial state with key: impact.
        """
        # TODO: Implement business impact estimation.
        impact: BusinessImpact | None = None
        return {
            "impact": impact,
            "agent": self.name,
        }
