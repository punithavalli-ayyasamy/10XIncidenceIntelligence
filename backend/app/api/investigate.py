"""Incident investigation API routes (skeletons only)."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.models.incident import Incident, InvestigationResult
from app.services.orchestrator import IncidentOrchestrator

router = APIRouter()


class InvestigateRequest(BaseModel):
    """Request body to kick off (or re-run) an investigation."""

    incident_id: str | None = Field(
        default=None,
        description="Existing incident id; if omitted, detection may create one.",
    )
    service: str | None = Field(
        default=None,
        description="Service name to scope detection/investigation (e.g. payments).",
    )
    # TODO: Add time window, severity override, dry-run flags as needed.


class InvestigateResponse(BaseModel):
    """API response wrapping the investigation pipeline result."""

    incident: Incident | None = None
    result: InvestigationResult | None = None
    message: str = "Investigation pipeline not yet implemented."


@router.post(
    "/investigate",
    response_model=InvestigateResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Run autonomous incident investigation",
)
async def investigate(request: InvestigateRequest) -> InvestigateResponse:
    """
    Trigger the multi-agent investigation pipeline.

    TODO: Validate input, call IncidentOrchestrator.run(), stream/return results.
    """
    orchestrator = IncidentOrchestrator()
    # TODO: Replace placeholder with real orchestration.
    _ = await orchestrator.run(
        incident_id=request.incident_id,
        service=request.service,
    )
    return InvestigateResponse(
        message="TODO: Investigation pipeline not yet implemented.",
    )


@router.get(
    "/incidents/{incident_id}",
    response_model=InvestigateResponse,
    summary="Fetch investigation status / result",
)
async def get_incident(incident_id: str) -> InvestigateResponse:
    """
    Retrieve a previously created incident and its investigation result.

    TODO: Load from in-memory store / mock data — no database in this hackathon build.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=f"TODO: Fetch incident '{incident_id}' not yet implemented.",
    )


@router.get(
    "/incidents",
    response_model=list[Incident],
    summary="List known incidents",
)
async def list_incidents() -> list[Incident]:
    """
    List incidents known to the platform (mock / in-memory).

    TODO: Return incidents from detection agent / mock store.
    """
    return []
