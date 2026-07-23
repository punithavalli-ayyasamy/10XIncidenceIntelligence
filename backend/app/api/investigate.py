"""Incident investigation API routes."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.agents.detection_agent import DetectionResult
from app.models.incident import Incident, InvestigationResult
from app.services.orchestrator import IncidentOrchestrator

router = APIRouter()

# Shared orchestrator instance for in-memory incident store within process lifetime.
_orchestrator = IncidentOrchestrator()


class InvestigateRequest(BaseModel):
    """Request body to kick off detection / investigation."""

    incident_id: str | None = Field(
        default=None,
        description="Existing incident id; if omitted, detection may create one.",
    )
    service: str | None = Field(
        default="payment-service",
        description="Service name to scope detection/investigation.",
    )


class DetectResponse(BaseModel):
    """DetectionAgent structured output (+ optional Incident)."""

    detection: DetectionResult
    incident: Incident | None = None
    message: str = "Detection complete."


class InvestigateResponse(BaseModel):
    """API response wrapping detection / investigation pipeline result."""

    detection: DetectionResult | None = None
    incident: Incident | None = None
    result: InvestigationResult | None = None
    message: str = "Investigation pipeline partial."


@router.post(
    "/detect",
    response_model=DetectResponse,
    status_code=status.HTTP_200_OK,
    summary="Run DetectionAgent on payment metrics",
)
async def detect(request: InvestigateRequest | None = None) -> DetectResponse:
    """Analyze payment_metrics.json and decide whether to open an incident."""
    body = request or InvestigateRequest()
    out = await _orchestrator.detect(service=body.service)
    detection: DetectionResult = out["detection"]
    incident = out.get("incident")
    msg = (
        "Incident created; hand off to InvestigationAgent."
        if detection.incident_created
        else "No incident created."
    )
    return DetectResponse(detection=detection, incident=incident, message=msg)


@router.post(
    "/investigate",
    response_model=InvestigateResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Run autonomous incident investigation (starts with detection)",
)
async def investigate(request: InvestigateRequest) -> InvestigateResponse:
    """Trigger detection (and later full multi-agent investigation)."""
    detect_out = await _orchestrator.detect(service=request.service)
    detection: DetectionResult = detect_out["detection"]
    incident = detect_out.get("incident")

    result = None
    if detection.incident_created and isinstance(incident, Incident):
        result = InvestigationResult(
            incident_id=incident.id,
            agent_traces={"detection": detection.model_dump()},
        )

    return InvestigateResponse(
        detection=detection,
        incident=incident,
        result=result,
        message=(
            "Detection complete; investigation agents not fully wired yet."
            if detection.incident_created
            else "Detection complete; no incident opened."
        ),
    )


@router.get(
    "/incidents/{incident_id}",
    response_model=InvestigateResponse,
    summary="Fetch investigation status / result",
)
async def get_incident(incident_id: str) -> InvestigateResponse:
    """Retrieve a previously created incident from in-memory store."""
    incident = _orchestrator.get_incident(incident_id)
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident '{incident_id}' not found. Run POST /api/v1/detect first.",
        )
    return InvestigateResponse(
        incident=incident,
        message="Incident loaded from in-memory store.",
    )


@router.get(
    "/incidents",
    response_model=list[Incident],
    summary="List known incidents",
)
async def list_incidents() -> list[Incident]:
    """List incidents created during this process lifetime."""
    return _orchestrator.list_incidents()
