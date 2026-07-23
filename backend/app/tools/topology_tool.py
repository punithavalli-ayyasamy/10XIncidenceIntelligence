"""Topology tool — service dependency graph from mock JSON."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_MOCK_DIR = Path(__file__).resolve().parent.parent / "mock_data"


class TopologyTool:
    """Read service topology / dependency graph from mock JSON."""

    def __init__(self, mock_dir: Path | None = None) -> None:
        self.mock_dir = mock_dir or _MOCK_DIR

    async def load_raw(self, filename: str = "topology.json") -> dict[str, Any]:
        path = self.mock_dir / filename
        if not path.exists():
            raise FileNotFoundError(f"Topology file not found: {path}")
        with path.open(encoding="utf-8") as fh:
            data = json.load(fh)
        if not isinstance(data, dict):
            raise ValueError(f"Expected object in {filename}")
        return data

    async def get_graph(self) -> dict[str, Any]:
        """Return the full topology document."""
        return await self.load_raw()

    def _normalize_service_id(self, service: str, nodes: list[dict[str, Any]]) -> str:
        raw = service.lower().replace("_", "-")
        aliases = {
            "payment-service": "payment",
            "payments": "payment",
            "payment": "payment",
            "checkout-service": "checkout",
            "order-service": "order",
            "inventory-service": "inventory",
            "notification-service": "notification",
            "fraud-detection-service": "fraud-detection",
            "api_gateway": "api-gateway",
        }
        candidate = aliases.get(raw, raw)
        ids = {str(n.get("id")) for n in nodes if isinstance(n, dict)}
        if candidate in ids:
            return candidate
        for node_id in ids:
            if candidate in node_id or node_id in candidate:
                return node_id
        return candidate

    async def get_dependencies(self, service: str) -> dict[str, Any]:
        """Return upstream callers and downstream dependencies for a service."""
        graph = await self.get_graph()
        nodes = graph.get("nodes", [])
        edges = graph.get("edges", [])
        if not isinstance(nodes, list):
            nodes = []
        if not isinstance(edges, list):
            edges = []

        node_id = self._normalize_service_id(service, nodes)
        node = next((n for n in nodes if isinstance(n, dict) and n.get("id") == node_id), None)

        downstream = list(node.get("depends_on", [])) if isinstance(node, dict) else []
        upstream: list[str] = []
        for edge in edges:
            if not isinstance(edge, dict):
                continue
            if edge.get("to") == node_id and edge.get("from"):
                upstream.append(str(edge["from"]))
            # Also infer upstream from depends_on of other nodes
        for other in nodes:
            if not isinstance(other, dict):
                continue
            deps = other.get("depends_on", [])
            if isinstance(deps, list) and node_id in deps:
                oid = str(other.get("id"))
                if oid not in upstream:
                    upstream.append(oid)

        hints = graph.get("blast_radius_hints", {})
        blast = hints.get(node_id) if isinstance(hints, dict) else None

        return {
            "service": node_id,
            "node": node,
            "upstream": upstream,
            "downstream": downstream,
            "blast_radius": blast,
        }
