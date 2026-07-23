"""Dependency agent — topology / blast-radius analysis."""

from typing import Any

from app.agents import BaseAgent


class DependencyAgent(BaseAgent):
    """
    Maps service dependencies and estimates blast radius from topology data.

    TODO: Use TopologyTool to load service graph from mock_data/topology.json.
    TODO: Identify upstream/downstream services for the affected node.
    TODO: Feed dependency context into impact and recommendation agents.
    """

    name = "dependency_agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        """
        Expected context keys (TBD): incident.service, topology.

        Returns partial state with keys like: dependencies, blast_radius.
        """
        # TODO: Implement dependency / blast-radius analysis.
        return {
            "dependencies": [],
            "blast_radius": [],
            "agent": self.name,
        }
