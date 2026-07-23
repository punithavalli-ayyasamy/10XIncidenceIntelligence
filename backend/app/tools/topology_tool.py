"""Topology tool — service dependency graph from mock JSON."""

from pathlib import Path
from typing import Any

_MOCK_DIR = Path(__file__).resolve().parent.parent / "mock_data"


class TopologyTool:
    """
    Interface for reading service topology / dependency graph.

    TODO: Load topology.json.
    TODO: Resolve neighbors (upstream / downstream) for a given service.
    TODO: Support blast-radius walk for dependency agent.
    """

    def __init__(self, mock_dir: Path | None = None) -> None:
        self.mock_dir = mock_dir or _MOCK_DIR

    async def get_graph(self) -> dict[str, Any]:
        """Return the full topology graph."""
        # TODO: Load and return topology.json.
        return {"nodes": [], "edges": []}

    async def get_dependencies(self, service: str) -> dict[str, Any]:
        """Return upstream and downstream dependencies for a service."""
        # TODO: Traverse graph for service.
        _ = service
        return {"upstream": [], "downstream": []}

    async def load_raw(self, filename: str = "topology.json") -> dict[str, Any]:
        """Load raw topology JSON blob."""
        # TODO: Read and return JSON from self.mock_dir / filename.
        _ = filename
        return {}
