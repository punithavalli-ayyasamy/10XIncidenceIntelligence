"""Logs tool — load and query application / service logs from mock JSON."""

from pathlib import Path
from typing import Any

_MOCK_DIR = Path(__file__).resolve().parent.parent / "mock_data"


class LogsTool:
    """
    Interface for reading service logs.

    TODO: Load payment_logs.json.
    TODO: Filter by service, severity, time window, correlation ids.
    TODO: Surface error bursts relevant to investigation agent.
    """

    def __init__(self, mock_dir: Path | None = None) -> None:
        self.mock_dir = mock_dir or _MOCK_DIR

    async def get_logs(
        self,
        service: str,
        severity: str | None = None,
        **kwargs: Any,
    ) -> list[dict[str, Any]]:
        """Fetch log entries for a service from mock data."""
        # TODO: Implement JSON load + filter.
        _ = (service, severity, kwargs)
        return []

    async def load_raw(self, filename: str = "payment_logs.json") -> dict[str, Any]:
        """Load raw logs JSON blob."""
        # TODO: Read and return JSON from self.mock_dir / filename.
        _ = filename
        return {}
