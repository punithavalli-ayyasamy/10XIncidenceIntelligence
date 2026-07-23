"""Pydantic models for metrics and anomaly signals."""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class MetricType(str, Enum):
    """Supported metric kinds for detection."""

    LATENCY = "latency"
    ERROR_RATE = "error_rate"
    THROUGHPUT = "throughput"
    SATURATION = "saturation"
    CUSTOM = "custom"


class MetricPoint(BaseModel):
    """A single time-series sample."""

    timestamp: datetime
    value: float
    labels: dict[str, str] = Field(default_factory=dict)


class MetricSeries(BaseModel):
    """Named metric time series for a service."""

    name: str
    service: str
    metric_type: MetricType = MetricType.CUSTOM
    unit: str | None = None
    points: list[MetricPoint] = Field(default_factory=list)
    # TODO: Add aggregation window, source system, SLO thresholds.


class AnomalySignal(BaseModel):
    """Detection output: an anomalous metric window or spike."""

    metric_name: str
    service: str
    severity_score: float = Field(ge=0.0, le=1.0, default=0.0)
    started_at: datetime | None = None
    ended_at: datetime | None = None
    baseline_value: float | None = None
    observed_value: float | None = None
    message: str | None = None
    raw: dict[str, Any] = Field(default_factory=dict)
    # TODO: Wire scoring thresholds and multi-metric correlation.
