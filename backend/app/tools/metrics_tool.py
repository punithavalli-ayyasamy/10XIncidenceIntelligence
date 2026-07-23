"""Metrics tool — load and query metric time series from mock JSON."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.models.metric import MetricSeries

_MOCK_DIR = Path(__file__).resolve().parent.parent / "mock_data"


class MetricsTool:
    """Read service metrics from JSON mock data (no database)."""

    def __init__(self, mock_dir: Path | None = None) -> None:
        self.mock_dir = mock_dir or _MOCK_DIR

    async def load_raw(self, filename: str = "payment_metrics.json") -> dict[str, Any]:
        """Load a raw metrics JSON document from mock_data."""
        path = self.mock_dir / filename
        if not path.exists():
            raise FileNotFoundError(f"Metrics file not found: {path}")
        with path.open(encoding="utf-8") as fh:
            data = json.load(fh)
        if not isinstance(data, dict):
            raise ValueError(f"Expected object in {filename}")
        return data

    async def get_timeline(
        self,
        filename: str = "payment_metrics.json",
        service: str | None = None,
    ) -> list[dict[str, Any]]:
        """Return the metrics timeline array, optionally scoped by service name."""
        payload = await self.load_raw(filename)
        if service:
            payload_service = str(payload.get("service", "")).lower()
            if service.lower() not in payload_service and payload_service not in service.lower():
                # Still return data for payment mock when callers pass "payments" / "payment"
                aliases = {"payment", "payments", "payment-service"}
                if service.lower().replace("_", "-") not in aliases and payload_service not in aliases:
                    return []
        timeline = payload.get("timeline", [])
        return timeline if isinstance(timeline, list) else []

    async def get_series(
        self,
        service: str,
        metric_name: str | None = None,
        **kwargs: Any,
    ) -> list[MetricSeries]:
        """
        Optional adapter into MetricSeries models.

        DetectionAgent primarily uses get_timeline / load_raw.
        """
        _ = kwargs
        timeline = await self.get_timeline(service=service)
        if not timeline:
            return []

        field = metric_name or "latency_ms"
        points = []
        from datetime import datetime

        from app.models.metric import MetricPoint, MetricType

        for row in timeline:
            ts_raw = row.get("timestamp")
            val = row.get(field)
            if ts_raw is None or not isinstance(val, (int, float)):
                continue
            ts = datetime.fromisoformat(str(ts_raw).replace("Z", "+00:00"))
            points.append(MetricPoint(timestamp=ts, value=float(val)))

        return [
            MetricSeries(
                name=field,
                service=service,
                metric_type=MetricType.CUSTOM,
                points=points,
            )
        ]
