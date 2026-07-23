"""Application settings loaded from environment / .env (never hardcode secrets)."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ — where uvicorn is typically started from
_BACKEND_ROOT = Path(__file__).resolve().parents[2]
_ENV_FILE = _BACKEND_ROOT / ".env"


class Settings(BaseSettings):
    """
    Secure configuration via environment variables.

    Priority (highest wins):
      1. Real OS environment variables
      2. backend/.env file
      3. Field defaults below
    """

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    gemini_api_key: str | None = Field(
        default=None,
        description="Google Gemini API key. Set via GEMINI_API_KEY in .env or the environment.",
    )
    gemini_model: str = Field(
        default="gemini-2.0-flash",
        description="Gemini model id (GEMINI_MODEL).",
    )
    allow_heuristic_llm_fallback: bool = Field(
        default=True,
        description="If true, use HeuristicLLMService when Gemini key is missing.",
    )

    @property
    def resolved_gemini_api_key(self) -> str | None:
        """Return a real API key, ignoring empty / placeholder values from .env.example."""
        key = (self.gemini_api_key or "").strip()
        if not key or key in {"your_gemini_api_key_here", "changeme", "TODO"}:
            return None
        return key


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton — safe to call from anywhere."""
    return Settings()
