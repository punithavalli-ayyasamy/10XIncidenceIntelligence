"""Prediction agent — forecasts incident progression / risk."""

from typing import Any

from app.agents import BaseAgent


class PredictionAgent(BaseAgent):
    """
    Predicts how the incident may evolve (spread, duration, SLA breach risk).

    TODO: Load prediction_prompt.txt.
    TODO: Combine trend metrics + topology + traffic to forecast risk.
    TODO: Return structured prediction for UI / remediation prioritization.
    """

    name = "prediction_agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        """
        Expected context keys (TBD): incident, anomalies, impact, dependencies.

        Returns partial state with key: prediction.
        """
        # TODO: Implement progression / risk prediction.
        return {
            "prediction": None,
            "agent": self.name,
        }
