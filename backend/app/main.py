"""10X Incident Intelligence — FastAPI application entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.investigate import router as investigate_router
from app.core.config import get_settings

# Load settings early so .env / GEMINI_API_KEY are available app-wide.
settings = get_settings()

app = FastAPI(
    title="10X Incident Intelligence",
    description=(
        "Autonomous AI incident investigation platform: detect anomalies, "
        "investigate root cause, predict business impact, and recommend remediation."
    ),
    version="0.1.0",
)

# Local Vite (5173) + Cloud Run UI origins for the hackathon demo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(investigate_router, prefix="/api/v1", tags=["investigate"])


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness probe."""
    return {"status": "ok"}
