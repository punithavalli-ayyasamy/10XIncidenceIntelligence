"""LLM service abstraction — Gemini behind a swappable interface."""

from __future__ import annotations

import json
import logging
import re
from abc import ABC, abstractmethod
from typing import Any

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class LLMService(ABC):
    """
    Provider-agnostic LLM interface used by agents.

    Gemini (and future providers) implement this contract so agents stay decoupled
    from vendor SDKs.
    """

    @abstractmethod
    async def generate(self, prompt: str, **kwargs: Any) -> str:
        """Return raw text completion for the given prompt."""

    @abstractmethod
    async def generate_json(self, prompt: str, **kwargs: Any) -> dict[str, Any]:
        """Return a parsed JSON object from the model response."""


def _extract_json_object(text: str) -> dict[str, Any]:
    """Parse JSON from a model response, tolerating markdown fences."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if not match:
            raise
        data = json.loads(match.group(0))
    if not isinstance(data, dict):
        raise ValueError("LLM JSON response must be an object")
    return data


class GeminiLLMService(LLMService):
    """Google Gemini implementation of LLMService."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
    ) -> None:
        settings = get_settings()
        self.api_key = api_key or settings.resolved_gemini_api_key
        self.model_name = model or settings.gemini_model
        self._model = None

        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY is required for GeminiLLMService. "
                "Set it in backend/.env (see .env.example) or export it in your shell. "
                "Never hardcode the key in source code."
            )

        import google.generativeai as genai

        genai.configure(api_key=self.api_key)
        self._model = genai.GenerativeModel(self.model_name)

    async def generate(self, prompt: str, **kwargs: Any) -> str:
        # google-generativeai generate_content is sync; run as-is for hackathon simplicity.
        _ = kwargs
        assert self._model is not None
        response = self._model.generate_content(prompt)
        text = getattr(response, "text", None)
        if not text:
            raise RuntimeError("Gemini returned an empty response")
        return text

    async def generate_json(self, prompt: str, **kwargs: Any) -> dict[str, Any]:
        text = await self.generate(prompt, **kwargs)
        return _extract_json_object(text)


class HeuristicLLMService(LLMService):
    """
    Offline stand-in when Gemini is unavailable.

    Does NOT apply absolute hardcoded SLO thresholds. It compares early vs late
    windows across multiple metrics and reasons about correlated degradation.
    """

    async def generate(self, prompt: str, **kwargs: Any) -> str:
        result = await self.generate_json(prompt, **kwargs)
        return json.dumps(result)

    async def generate_json(self, prompt: str, **kwargs: Any) -> dict[str, Any]:
        _ = kwargs
        # InvestigationAgent embeds EVIDENCE_PACK — synthesize RCA from that pack only.
        if "EVIDENCE_PACK:" in prompt:
            pack = _evidence_pack_from_prompt(prompt)
            return _reason_over_evidence_pack(pack)
        timeline = _timeline_from_prompt(prompt)
        return _reason_over_timeline(timeline)


class ResilientLLMService(LLMService):
    """
    Tries a primary LLM (e.g. Gemini); on runtime failures (quota 429, network,
    empty responses, JSON parse errors) falls back to a secondary service.
    """

    def __init__(
        self,
        primary: LLMService,
        fallback: LLMService,
    ) -> None:
        self.primary = primary
        self.fallback = fallback
        self.last_provider: str = type(primary).__name__
        self.last_fallback_reason: str | None = None

    async def generate(self, prompt: str, **kwargs: Any) -> str:
        try:
            text = await self.primary.generate(prompt, **kwargs)
            self.last_provider = type(self.primary).__name__
            self.last_fallback_reason = None
            return text
        except Exception as exc:
            self.last_provider = type(self.fallback).__name__
            self.last_fallback_reason = f"{type(exc).__name__}: {exc}"
            logger.warning(
                "Primary LLM failed (%s); falling back to %s",
                self.last_fallback_reason,
                type(self.fallback).__name__,
            )
            return await self.fallback.generate(prompt, **kwargs)

    async def generate_json(self, prompt: str, **kwargs: Any) -> dict[str, Any]:
        try:
            data = await self.primary.generate_json(prompt, **kwargs)
            self.last_provider = type(self.primary).__name__
            self.last_fallback_reason = None
            return data
        except Exception as exc:
            self.last_provider = type(self.fallback).__name__
            self.last_fallback_reason = f"{type(exc).__name__}: {exc}"
            logger.warning(
                "Primary LLM JSON failed (%s); falling back to %s",
                self.last_fallback_reason,
                type(self.fallback).__name__,
            )
            return await self.fallback.generate_json(prompt, **kwargs)


def _timeline_from_prompt(prompt: str) -> list[dict[str, Any]]:
    """Best-effort extract of the METRICS_JSON block embedded by DetectionAgent."""
    marker = "METRICS_JSON:"
    if marker not in prompt:
        return []
    raw = prompt.split(marker, 1)[1].strip()
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
        if not match:
            return []
        payload = json.loads(match.group(0))
    if isinstance(payload, dict):
        timeline = payload.get("timeline", [])
        return timeline if isinstance(timeline, list) else []
    return []


def _evidence_pack_from_prompt(prompt: str) -> dict[str, Any]:
    """Extract EVIDENCE_PACK JSON embedded by InvestigationAgent."""
    marker = "EVIDENCE_PACK:"
    if marker not in prompt:
        return {}
    raw = prompt.split(marker, 1)[1].strip()
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
        if not match:
            return {}
        payload = json.loads(match.group(0))
    return payload if isinstance(payload, dict) else {}


def _reason_over_evidence_pack(pack: dict[str, Any]) -> dict[str, Any]:
    """
    Offline RCA using only facts present in the evidence pack.

    Delegates to InvestigationAgent.synthesize_from_evidence to keep one source of truth.
    """
    from app.agents.investigation_agent import InvestigationAgent

    finding = InvestigationAgent.synthesize_from_evidence(pack)
    return finding.model_dump()


def _avg(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def _reason_over_timeline(timeline: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Multi-metric relative reasoning: compare first third vs last third.

    Incident if several signals worsen together (traffic, latency, errors,
    saturation), without fixed absolute cutoffs.
    """
    if len(timeline) < 6:
        return {
            "incident_created": False,
            "severity": "low",
            "confidence": 0.4,
            "reason": "Insufficient metric history to judge degradation trends.",
            "summary": "Not enough timeline samples for multi-metric incident detection.",
            "affected_service": "payment-service",
            "next_agent": "InvestigationAgent",
        }

    n = len(timeline)
    early = timeline[: max(1, n // 3)]
    late = timeline[-max(1, n // 3) :]

    def series(key: str, window: list[dict[str, Any]]) -> list[float]:
        out: list[float] = []
        for row in window:
            val = row.get(key)
            if isinstance(val, (int, float)):
                out.append(float(val))
        return out

    keys = [
        "requests_per_sec",
        "latency_ms",
        "error_rate",
        "cpu",
        "db_connections_used",
        "thread_pool_usage",
        "memory",
    ]
    ratios: dict[str, float] = {}
    for key in keys:
        e = _avg(series(key, early))
        l = _avg(series(key, late))
        ratios[key] = (l / e) if e > 0 else (2.0 if l > 0 else 1.0)

    # success_rate falling is bad — invert via failure proxy
    early_success = _avg(series("success_rate", early))
    late_success = _avg(series("success_rate", late))
    success_drop = early_success - late_success

    # Correlated degradation score from relative movement (not absolute thresholds)
    pressure_signals = 0
    evidence: list[str] = []

    if ratios["latency_ms"] > 1.5 and ratios["error_rate"] > 1.5:
        pressure_signals += 2
        evidence.append(
            f"latency and error_rate rose together "
            f"(~{ratios['latency_ms']:.1f}x / ~{ratios['error_rate']:.1f}x vs early window)"
        )
    elif ratios["latency_ms"] > 1.5 or ratios["error_rate"] > 1.5:
        pressure_signals += 1
        evidence.append("either latency or error_rate worsened materially vs early window")

    if ratios["requests_per_sec"] > 1.4 and (
        ratios["cpu"] > 1.3 or ratios["db_connections_used"] > 1.3 or ratios["thread_pool_usage"] > 1.3
    ):
        pressure_signals += 2
        evidence.append(
            "traffic growth coincided with resource saturation "
            f"(rps ~{ratios['requests_per_sec']:.1f}x, "
            f"cpu ~{ratios['cpu']:.1f}x, db_conn ~{ratios['db_connections_used']:.1f}x)"
        )

    if success_drop > 0 and ratios["error_rate"] > 1.2:
        pressure_signals += 1
        evidence.append(
            f"success_rate declined by ~{success_drop:.3f} while errors climbed"
        )

    # Pool near-limit relative to its own limit field (structural, not a magic error threshold)
    late_db = late[-1] if late else {}
    used = late_db.get("db_connections_used")
    limit = late_db.get("db_connection_limit")
    if isinstance(used, (int, float)) and isinstance(limit, (int, float)) and limit > 0:
        util = used / limit
        if util >= 0.9 and ratios["db_connections_used"] > 1.3:
            pressure_signals += 1
            evidence.append(
                f"DB connection pool approached capacity ({used}/{limit}) after rising usage"
            )

    incident = pressure_signals >= 3
    if pressure_signals >= 5:
        severity = "critical"
        confidence = 0.92
    elif pressure_signals >= 4:
        severity = "high"
        confidence = 0.85
    elif pressure_signals >= 3:
        severity = "high"
        confidence = 0.78
    elif pressure_signals >= 2:
        severity = "medium"
        confidence = 0.6
    else:
        severity = "low"
        confidence = 0.45

    service = "payment-service"
    if incident:
        reason = (
            "Multi-metric correlation indicates progressive degradation under rising load: "
            + "; ".join(evidence)
        )
        summary = (
            f"{service} shows Black Friday–style degradation: traffic, latency, errors, "
            "and saturation signals worsened together across the timeline — incident warranted."
        )
    else:
        reason = (
            "Early vs late windows do not show enough correlated multi-metric degradation "
            "to justify opening an incident."
        )
        summary = f"No incident created for {service}; metrics remain within a coherent healthy trend."

    return {
        "incident_created": incident,
        "severity": severity,
        "confidence": confidence,
        "reason": reason,
        "summary": summary,
        "affected_service": service,
        "next_agent": "InvestigationAgent",
    }


def create_llm_service(
    api_key: str | None = None,
    model: str | None = None,
    *,
    allow_heuristic_fallback: bool | None = None,
) -> LLMService:
    """
    Factory: prefer Gemini when an API key is present; wrap with runtime fallback.

    Catch-and-fallback covers quota (429), network errors, empty responses, etc.
    Reads secrets from Settings (env / backend/.env) — never from committed files.
    """
    settings = get_settings()
    key = api_key or settings.resolved_gemini_api_key
    model_name = model or settings.gemini_model
    use_fallback = (
        settings.allow_heuristic_llm_fallback
        if allow_heuristic_fallback is None
        else allow_heuristic_fallback
    )
    heuristic = HeuristicLLMService()

    if key:
        try:
            gemini = GeminiLLMService(api_key=key, model=model_name)
        except Exception as exc:
            if not use_fallback:
                raise
            logger.warning(
                "GeminiLLMService init failed (%s); using HeuristicLLMService only",
                exc,
            )
            return heuristic

        if use_fallback:
            return ResilientLLMService(primary=gemini, fallback=heuristic)
        return gemini

    if use_fallback:
        return heuristic
    raise ValueError(
        "No LLMService available. Set GEMINI_API_KEY in backend/.env "
        "(copy from .env.example) or enable ALLOW_HEURISTIC_LLM_FALLBACK."
    )
