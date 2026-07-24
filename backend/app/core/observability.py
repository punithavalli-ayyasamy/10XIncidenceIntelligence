"""Cloud Logging (stdout) + Cloud Trace (OpenTelemetry) for local and Cloud Run."""

from __future__ import annotations

import json
import logging
import os
import sys
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Iterator

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)

_TRACING_READY = False
_LOGGING_READY = False


def _running_on_cloud_run() -> bool:
    return bool(os.environ.get("K_SERVICE"))


class CloudRunJsonFormatter(logging.Formatter):
    """
    JSON logs that Cloud Logging parses on Cloud Run (severity, message, trace).

    See: https://cloud.google.com/logging/docs/structured-logging
    """

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "severity": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "time": datetime.now(timezone.utc).isoformat(),
        }
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)

        # Correlate with Cloud Trace when a span is active
        try:
            from opentelemetry import trace

            span_ctx = trace.get_current_span().get_span_context()
            if span_ctx and span_ctx.is_valid:
                project = os.environ.get("GOOGLE_CLOUD_PROJECT") or os.environ.get(
                    "GCP_PROJECT"
                )
                trace_id = format(span_ctx.trace_id, "032x")
                if project:
                    payload["logging.googleapis.com/trace"] = (
                        f"projects/{project}/traces/{trace_id}"
                    )
                payload["logging.googleapis.com/spanId"] = format(span_ctx.span_id, "016x")
        except Exception:  # noqa: BLE001
            pass

        return json.dumps(payload, default=str)


def setup_cloud_logging(settings: Settings | None = None) -> None:
    """
    Configure logging for Cloud Logging ingestion.

    On Cloud Run (or ENABLE_CLOUD_LOGGING), emit structured JSON to stdout.
    Locally, use a readable text format unless forced.
    """
    global _LOGGING_READY
    if _LOGGING_READY:
        return

    settings = settings or get_settings()
    use_json = settings.enable_cloud_logging or (
        settings.cloud_observability_auto and _running_on_cloud_run()
    )

    root = logging.getLogger()
    root.handlers.clear()
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))

    if use_json:
        handler.setFormatter(CloudRunJsonFormatter())
        logger_msg = "Structured JSON logging enabled (Cloud Logging compatible)"
    else:
        handler.setFormatter(
            logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s")
        )
        logger_msg = "Console logging enabled (set ENABLE_CLOUD_LOGGING=true for JSON)"

    root.addHandler(handler)
    root.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))
    _LOGGING_READY = True
    logging.getLogger(__name__).info(
        "%s service=%s", logger_msg, settings.service_name
    )


def setup_cloud_trace(settings: Settings | None = None) -> None:
    """Configure OpenTelemetry → Cloud Trace exporter (optional console exporter)."""
    global _TRACING_READY
    if _TRACING_READY:
        return

    settings = settings or get_settings()
    enable = settings.enable_cloud_trace or (
        settings.cloud_observability_auto and _running_on_cloud_run()
    )

    try:
        from opentelemetry import trace
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter

        resource = Resource.create(
            {
                "service.name": settings.service_name,
                "service.version": settings.service_version,
                "cloud.provider": "gcp" if _running_on_cloud_run() else "local",
            }
        )
        provider = TracerProvider(resource=resource)

        if enable:
            try:
                from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter

                exporter = CloudTraceSpanExporter()
                provider.add_span_processor(BatchSpanProcessor(exporter))
                logging.getLogger(__name__).info(
                    "Cloud Trace exporter enabled service=%s", settings.service_name
                )
            except Exception as exc:  # noqa: BLE001
                logging.getLogger(__name__).warning(
                    "Cloud Trace exporter failed (%s); console exporter fallback=%s",
                    exc,
                    settings.trace_console_export,
                )
                if settings.trace_console_export:
                    provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
        elif settings.trace_console_export:
            provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
            logging.getLogger(__name__).info("Trace console exporter enabled (local)")
        else:
            logging.getLogger(__name__).info(
                "Cloud Trace disabled (set ENABLE_CLOUD_TRACE=true to export)"
            )

        trace.set_tracer_provider(provider)
    except Exception as exc:  # noqa: BLE001
        logging.getLogger(__name__).warning("OpenTelemetry setup failed (%s)", exc)

    _TRACING_READY = True


def instrument_fastapi(app: Any, settings: Settings | None = None) -> None:
    """Instrument FastAPI/ASGI request spans when tracing is enabled."""
    settings = settings or get_settings()
    enable = (
        settings.enable_cloud_trace
        or (settings.cloud_observability_auto and _running_on_cloud_run())
        or settings.trace_console_export
    )
    if not enable:
        return
    try:
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

        FastAPIInstrumentor.instrument_app(app, excluded_urls="health")
        logging.getLogger(__name__).info("FastAPI OpenTelemetry instrumentation enabled")
    except Exception as exc:  # noqa: BLE001
        logging.getLogger(__name__).warning("FastAPI instrumentation failed (%s)", exc)


def get_tracer(name: str = "tenx-incident"):
    """Return an OpenTelemetry tracer (noop-safe if SDK missing)."""
    try:
        from opentelemetry import trace

        return trace.get_tracer(name)
    except Exception:  # noqa: BLE001

        class _NoopSpan:
            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            def set_attribute(self, *args, **kwargs):
                return None

            def add_event(self, *args, **kwargs):
                return None

            def record_exception(self, *args, **kwargs):
                return None

            def set_status(self, *args, **kwargs):
                return None

        class _NoopTracer:
            def start_as_current_span(self, *args, **kwargs):
                return _NoopSpan()

        return _NoopTracer()


@contextmanager
def span(name: str, **attributes: Any) -> Iterator[Any]:
    """Convenience context manager for a traced span with attributes."""
    tracer = get_tracer()
    with tracer.start_as_current_span(name) as current:
        for key, value in attributes.items():
            if value is None:
                continue
            try:
                current.set_attribute(key, value)
            except Exception:  # noqa: BLE001
                pass
        yield current


def setup_observability(app: Any | None = None, settings: Settings | None = None) -> None:
    """Initialize logging + tracing; optionally instrument a FastAPI app."""
    settings = settings or get_settings()
    setup_cloud_logging(settings)
    setup_cloud_trace(settings)
    if app is not None:
        instrument_fastapi(app, settings)
