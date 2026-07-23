"""Metrics tool — load and query metric time series from mock JSON."""

from pathlib import Path
from typing import Any

from app.models.metric import MetricSeries

# Default mock data path relative to the app package.
_MOCK_DIR = Path(__file__).resolve().parent.parent / "mock_data"


class MetricsTool:
    """
    Interface for reading service metrics.

    TODO: Load payment_metrics.json (and other series files).
    TODO: Filter by service, metric name, and time window.
    TODO: Optionally compute simple aggregates for detection agent.
    """

    def __init__(self, mock_dir: Path | None = None) -> None:
        self.mock_dir = mock_dir or _MOCK_DIR

    async def get_series(
        self,
        service: str,
        metric_name: str | None = None,
        **kwargs: Any,
    ) -> list[MetricSeries]:
        """Fetch metric series for a service from mock data."""
        # TODO: Implement JSON load + filter.
        _ = (service, metric_name, kwargs)
        return []

    async def load_raw(self, filename: str = "payment_metrics.json") -> dict[str, Any]:
        """Load raw metrics JSON blob."""
        # TODO: Read and return JSON from self.mock_dir / filename.
        _ = filename
        return {}
