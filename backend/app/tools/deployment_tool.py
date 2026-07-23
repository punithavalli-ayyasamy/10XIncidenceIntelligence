"""Deployment tool — recent deploys / change events from mock JSON."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_MOCK_DIR = Path(__file__).resolve().parent.parent / "mock_data"


class DeploymentTool:
    """Read deployment and change history from mock JSON."""

    def __init__(self, mock_dir: Path | None = None) -> None:
        self.mock_dir = mock_dir or _MOCK_DIR

    async def load_raw(self, filename: str = "deployments.json") -> dict[str, Any]:
        path = self.mock_dir / filename
        if not path.exists():
            raise FileNotFoundError(f"Deployments file not found: {path}")
        with path.open(encoding="utf-8") as fh:
            data = json.load(fh)
        if not isinstance(data, dict):
            raise ValueError(f"Expected object in {filename}")
        return data

    async def get_deployments(
        self,
        service: str | None = None,
        **kwargs: Any,
    ) -> list[dict[str, Any]]:
        """Fetch recent deployments, optionally scoped to a service."""
        _ = kwargs
        payload = await self.load_raw()
        deployments = payload.get("deployments", [])
        if not isinstance(deployments, list):
            return []

        if not service:
            return [d for d in deployments if isinstance(d, dict)]

        svc = service.lower().replace("_", "-")
        aliases = {
            "payment",
            "payments",
            "payment-service",
            "checkout",
            "checkout-service",
        }
        out: list[dict[str, Any]] = []
        for dep in deployments:
            if not isinstance(dep, dict):
                continue
            dep_svc = str(dep.get("service", "")).lower().replace("_", "-")
            if svc in dep_svc or dep_svc in svc or (svc in aliases and dep_svc in aliases):
                out.append(dep)
            # Also include related services that may amplify load
            elif service.lower().startswith("payment") and "checkout" in dep_svc:
                out.append(dep)
        return out
