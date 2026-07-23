"""Pydantic models for incidents and investigation artifacts."""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class IncidentSeverity(str, Enum):
    """Severity classification for an incident."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentStatus(str, Enum):
    """Lifecycle status of an incident."""

    DETECTED = "detected"
    INVESTIGATING = "investigating"
    ROOT_CAUSE_IDENTIFIED = "root_cause_identified"
    REMEDIATION_PROPOSED = "remediation_proposed"
    RESOLVED = "resolved"
    CLOSED = "closed"


class Incident(BaseModel):
    """Core incident record created by detection / investigation agents."""

    id: str = Field(..., description="Unique incident identifier.")
    title: str = Field(..., description="Short human-readable title.")
    service: str = Field(..., description="Primary affected service.")
    severity: IncidentSeverity = IncidentSeverity.MEDIUM
    status: IncidentStatus = IncidentStatus.DETECTED
    detected_at: datetime | None = None
    description: str | None = None
    # TODO: Link related metrics, log refs, deployment ids, topology nodes.
    metadata: dict[str, Any] = Field(default_factory=dict)


class RootCauseHypothesis(BaseModel):
    """A single root-cause hypothesis from the investigation agent."""

    summary: str
    confidence: float = Field(ge=0.0, le=1.0, default=0.0)
    evidence: list[str] = Field(default_factory=list)
    # TODO: Add structured evidence refs (metric windows, log lines, deploys).


class BusinessImpact(BaseModel):
    """Predicted / estimated business impact of the incident."""

    summary: str
    estimated_revenue_loss_usd: float | None = None
    affected_users: int | None = None
    sla_risk: str | None = None
    # TODO: Expand with product-specific KPIs.


class RemediationAction(BaseModel):
    """A recommended remediation step."""

    action: str
    priority: int = Field(default=1, ge=1)
    rationale: str | None = None
    # TODO: Add automation hooks / runbook links.


class InvestigationResult(BaseModel):
    """Aggregate output of the multi-agent investigation pipeline."""

    incident_id: str
    hypotheses: list[RootCauseHypothesis] = Field(default_factory=list)
    impact: BusinessImpact | None = None
    recommendations: list[RemediationAction] = Field(default_factory=list)
    agent_traces: dict[str, Any] = Field(
        default_factory=dict,
        description="Optional per-agent debug / reasoning traces.",
    )
    # TODO: Align fields with LangGraph state schema when graph is implemented.
