"""10X Incident Intelligence — FastAPI application entrypoint."""

from fastapi import FastAPI

from app.api.investigate import router as investigate_router

app = FastAPI(
    title="10X Incident Intelligence",
    description=(
        "Autonomous AI incident investigation platform: detect anomalies, "
        "investigate root cause, predict business impact, and recommend remediation."
    ),
    version="0.1.0",
)

app.include_router(investigate_router, prefix="/api/v1", tags=["investigate"])


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness probe."""
    return {"status": "ok"}


# TODO: Wire startup hooks (load mock data, init LLM client, LangGraph graph).
# TODO: Add CORS / auth middleware if needed for the hackathon demo UI.
