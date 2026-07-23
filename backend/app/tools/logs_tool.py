"""Logs tool — load and query application / service logs from mock JSON."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_MOCK_DIR = Path(__file__).resolve().parent.parent / "mock_data"


class LogsTool:
    """Read service logs from JSON mock data (no database)."""

    def __init__(self, mock_dir: Path | None = None) -> None:
        self.mock_dir = mock_dir or _MOCK_DIR

    async def load_raw(self, filename: str = "payment_logs.json") -> dict[str, Any]:
        path = self.mock_dir / filename
        if not path.exists():
            raise FileNotFoundError(f"Logs file not found: {path}")
        with path.open(encoding="utf-8") as fh:
            data = json.load(fh)
        if not isinstance(data, dict):
            raise ValueError(f"Expected object in {filename}")
        return data

    async def get_logs(
        self,
        service: str | None = None,
        severity: str | None = None,
        *,
        filename: str = "payment_logs.json",
        limit: int | None = None,
        levels: list[str] | None = None,
        **kwargs: Any,
    ) -> list[dict[str, Any]]:
        """Fetch log entries, optionally filtered by service / level."""
        _ = kwargs
        payload = await self.load_raw(filename)
        logs = payload.get("logs", [])
        if not isinstance(logs, list):
            return []

        out: list[dict[str, Any]] = []
        wanted_levels = None
        if levels:
            wanted_levels = {lvl.upper() for lvl in levels}
        elif severity:
            wanted_levels = {severity.upper()}

        for entry in logs:
            if not isinstance(entry, dict):
                continue
            if service:
                entry_svc = str(entry.get("service", "")).lower()
                svc = service.lower().replace("_", "-")
                if svc not in entry_svc and entry_svc not in svc:
                    aliases = {"payment", "payments", "payment-service"}
                    if svc not in aliases and entry_svc not in aliases:
                        continue
            if wanted_levels and str(entry.get("level", "")).upper() not in wanted_levels:
                continue
            out.append(entry)

        if limit is not None:
            return out[:limit]
        return out

    async def get_error_and_warn_highlights(
        self,
        *,
        filename: str = "payment_logs.json",
        limit: int = 40,
    ) -> list[dict[str, Any]]:
        """Return the most relevant WARN/ERROR lines for RCA (tail-weighted)."""
        logs = await self.get_logs(
            filename=filename,
            levels=["WARN", "ERROR"],
        )
        if len(logs) <= limit:
            return logs
        # Prefer later degradation window while keeping some mid-ramp context
        head = logs[: max(5, limit // 5)]
        tail = logs[-(limit - len(head)) :]
        seen: set[str] = set()
        merged: list[dict[str, Any]] = []
        for entry in head + tail:
            key = f"{entry.get('timestamp')}|{entry.get('message')}"
            if key in seen:
                continue
            seen.add(key)
            merged.append(entry)
        return merged[:limit]
