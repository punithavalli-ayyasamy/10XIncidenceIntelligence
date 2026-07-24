"""10X Incident Intelligence — FastAPI application entrypoint."""

from contextlib import asynccontextmanager
import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.investigate import router as investigate_router
from app.core.config import get_settings
from app.core.observability import setup_observability, span

# Load settings early so .env / GEMINI_API_KEY are available app-wide.
settings = get_settings()
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_observability(app, settings)
    logger.info(
        "Application started service=%s version=%s",
        settings.service_name,
        settings.service_version,
    )
    yield
    logger.info("Application shutting down service=%s", settings.service_name)


app = FastAPI(
    title="10X Incident Intelligence",
    description=(
        "Autonomous AI incident investigation platform: detect anomalies, "
        "investigate root cause, predict business impact, and recommend remediation."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# Local Vite (5173) + Cloud Run UI origins for the hackathon demo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    """Log each HTTP request with latency; correlates with Cloud Trace spans."""
    if request.url.path in {"/health", "/favicon.ico"}:
        return await call_next(request)

    started = time.perf_counter()
    with span(
        "http.request",
        http_method=request.method,
        http_route=request.url.path,
        http_target=str(request.url.path),
    ):
        try:
            response = await call_next(request)
        except Exception:
            logger.exception(
                "request_failed method=%s path=%s",
                request.method,
                request.url.path,
            )
            raise
        elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
        logger.info(
            "request_completed method=%s path=%s status=%s latency_ms=%s",
            request.method,
            request.url.path,
            response.status_code,
            elapsed_ms,
        )
        return response


app.include_router(investigate_router, prefix="/api/v1", tags=["investigate"])


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness probe."""
    return {"status": "ok"}
