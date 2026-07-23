"""Traffic tool — request volume / user traffic signals from mock or derived data."""

from pathlib import Path
from typing import Any

_MOCK_DIR = Path(__file__).resolve().parent.parent / "mock_data"


class TrafficTool:
    """
    Interface for reading traffic / demand signals used by impact & prediction.

    TODO: Derive traffic from metrics mock data or a dedicated traffic JSON.
    TODO: Expose RPS, active users, geographic / product breakdowns.
    TODO: Support baseline vs. current window comparison.
    """

    def __init__(self, mock_dir: Path | None = None) -> None:
        self.mock_dir = mock_dir or _MOCK_DIR

    async def get_traffic(
        self,
        service: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Fetch traffic summary for a service."""
        # TODO: Implement traffic lookup from mock metrics / dedicated file.
        _ = (service, kwargs)
        return {
            "service": service,
            "rps": None,
            "active_users": None,
        }

    async def compare_to_baseline(
        self,
        service: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Compare current traffic to a baseline window."""
        # TODO: Implement baseline comparison.
        _ = (service, kwargs)
        return {"delta_pct": None, "baseline": None, "current": None}
