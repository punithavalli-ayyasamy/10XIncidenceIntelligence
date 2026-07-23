"""Agent base types. Prefer app.services.llm_service.LLMService for LLM calls."""

from abc import ABC, abstractmethod
from typing import Any

from app.services.llm_service import GeminiLLMService, LLMService

# Backward-compatible aliases
LLMClient = LLMService
GeminiLLMClient = GeminiLLMService


class BaseAgent(ABC):
    """Shared base for all investigation agents."""

    name: str = "base_agent"

    def __init__(self, llm: LLMService | None = None) -> None:
        self.llm = llm

    @abstractmethod
    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        """
        Execute the agent against the shared investigation context.

        Returns a partial update to merge into the pipeline state.
        """
        ...
