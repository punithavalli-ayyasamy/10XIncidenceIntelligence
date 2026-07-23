"""Investigation agent — root-cause analysis from logs, metrics, deploys."""

from typing import Any

from app.agents import BaseAgent
from app.models.incident import RootCauseHypothesis


class InvestigationAgent(BaseAgent):
    """
    Investigates root cause using logs, metrics, and deployment history.

    TODO: Load investigation_prompt.txt.
    TODO: Correlate LogsTool + MetricsTool + DeploymentTool signals.
    TODO: Produce ranked RootCauseHypothesis list with confidence scores.
    """

    name = "investigation_agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        """
        Expected context keys (TBD): incident, anomalies, logs, deployments.

        Returns partial state with key: hypotheses.
        """
        # TODO: Implement root-cause investigation.
        hypotheses: list[RootCauseHypothesis] = []
        return {
            "hypotheses": hypotheses,
            "agent": self.name,
        }
