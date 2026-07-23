"""Incident investigation / orchestration API routes."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.agents.detection_agent import DetectionResult
from app.models.incident import Incident
from app.models.report import IncidentIntelligenceReport
from app.services.orchestrator import OrchestrationService

router = APIRouter()

# Shared orchestration service (in-memory report store for process lifetime).
_orchestration = OrchestrationService()


class PipelineRequest(BaseModel):
    """Request to run the AI orchestration pipeline."""

    service: str | None = Field(
        default="payment-service",
        description="Service to analyze (loads matching mock metrics when omitted metrics).",
    )
    incident_id: str | None = Field(
        default=None,
        description="Optional advisory incident id.",
    )


class DetectResponse(BaseModel):
    """Detection-only response (subset of the full report)."""

    detection: DetectionResult | None = None
    incident: Incident | None = None
    report: IncidentIntelligenceReport
    message: str = "Detection complete."


@router.post(
    "/report",
    response_model=IncidentIntelligenceReport,
    status_code=status.HTTP_200_OK,
    summary="Run full AI orchestration → Incident Intelligence Report",
)
async def run_report(request: PipelineRequest | None = None) -> IncidentIntelligenceReport:
    """
    Pipeline: metrics → DetectionAgent → [if incident] InvestigationAgent → Report.

    Each agent receives the previous agent's output via shared pipeline context.
    """
    body = request or PipelineRequest()
    return await _orchestration.run(
        service=body.service,
        incident_id=body.incident_id,
    )


@router.post(
    "/investigate",
    response_model=IncidentIntelligenceReport,
    status_code=status.HTTP_200_OK,
    summary="Alias for /report (detection + investigation pipeline)",
)
async def investigate(request: PipelineRequest | None = None) -> IncidentIntelligenceReport:
    """Same as POST /api/v1/report — returns one Incident Intelligence Report."""
    body = request or PipelineRequest()
    return await _orchestration.run(
        service=body.service,
        incident_id=body.incident_id,
    )


@router.post(
    "/detect",
    response_model=DetectResponse,
    status_code=status.HTTP_200_OK,
    summary="Run DetectionAgent only",
)
async def detect(request: PipelineRequest | None = None) -> DetectResponse:
    """Run DetectionAgent only and wrap the result in a report envelope."""
    body = request or PipelineRequest()
    report = await _orchestration.detect_only(service=body.service)
    msg = (
        "Incident created; hand off to InvestigationAgent via POST /api/v1/report."
        if report.detection and report.detection.incident_created
        else "No incident created."
    )
    return DetectResponse(
        detection=report.detection,
        incident=report.incident,
        report=report,
        message=msg,
    )


@router.get(
    "/reports/{report_id}",
    response_model=IncidentIntelligenceReport,
    summary="Fetch a previously generated report",
)
async def get_report(report_id: str) -> IncidentIntelligenceReport:
    report = _orchestration.get_report(report_id)
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found. Run POST /api/v1/report first.",
        )
    return report


@router.get(
    "/reports",
    response_model=list[IncidentIntelligenceReport],
    summary="List reports from this process",
)
async def list_reports() -> list[IncidentIntelligenceReport]:
    return _orchestration.list_reports()


@router.get(
    "/incidents/{incident_id}",
    response_model=Incident,
    summary="Fetch an incident record",
)
async def get_incident(incident_id: str) -> Incident:
    incident = _orchestration.get_incident(incident_id)
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident '{incident_id}' not found.",
        )
    return incident


@router.get(
    "/incidents",
    response_model=list[Incident],
    summary="List known incidents",
)
async def list_incidents() -> list[Incident]:
    return _orchestration.list_incidents()


@router.get(
    "/pipeline",
    summary="Show configured orchestration pipeline steps",
)
async def get_pipeline() -> dict[str, list[str]]:
    return {"pipeline": _orchestration.pipeline_names}
