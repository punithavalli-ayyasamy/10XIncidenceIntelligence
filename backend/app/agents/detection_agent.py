"""Detection agent — anomaly detection from metrics → incident creation."""

from typing import Any

from app.agents import BaseAgent
from app.models.incident import Incident
from app.models.metric import AnomalySignal


class DetectionAgent(BaseAgent):
    """
    Detects anomalies in service metrics and creates incidents.

    TODO: Load detection_prompt.txt and call LLM / rule engine.
    TODO: Use MetricsTool to pull recent series from mock_data.
    TODO: Emit AnomalySignal(s) and map to Incident records.
    """

    name = "detection_agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        """
        Expected context keys (TBD): service, time_window, metrics.

        Returns partial state with keys like: anomalies, incident.
        """
        # TODO: Implement anomaly detection logic.
        anomalies: list[AnomalySignal] = []
        incident: Incident | None = None
        return {
            "anomalies": anomalies,
            "incident": incident,
            "agent": self.name,
        }
