"""Deployment tool — recent deploys / change events from mock JSON."""

from pathlib import Path
from typing import Any

_MOCK_DIR = Path(__file__).resolve().parent.parent / "mock_data"


class DeploymentTool:
    """
    Interface for reading deployment and change history.

    TODO: Load deployments.json.
    TODO: Filter by service and time window near anomaly onset.
    TODO: Flag risky changes (config, schema, canary) for investigation.
    """

    def __init__(self, mock_dir: Path | None = None) -> None:
        self.mock_dir = mock_dir or _MOCK_DIR

    async def get_deployments(
        self,
        service: str | None = None,
        **kwargs: Any,
    ) -> list[dict[str, Any]]:
        """Fetch recent deployments, optionally scoped to a service."""
        # TODO: Implement JSON load + filter.
        _ = (service, kwargs)
        return []

    async def load_raw(self, filename: str = "deployments.json") -> dict[str, Any]:
        """Load raw deployments JSON blob."""
        # TODO: Read and return JSON from self.mock_dir / filename.
        _ = filename
        return {}
