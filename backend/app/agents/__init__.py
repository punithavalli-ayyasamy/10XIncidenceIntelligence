"""Abstract LLM / Gemini client interface and agent base types."""

from abc import ABC, abstractmethod
from typing import Any, Protocol


class LLMClient(Protocol):
    """
    Abstract interface for an LLM provider (e.g. Google Gemini).

    Implementations should live outside agent modules so agents stay swappable.
    """

    async def generate(self, prompt: str, **kwargs: Any) -> str:
        """Generate a text completion from the given prompt."""
        ...

    async def generate_json(self, prompt: str, **kwargs: Any) -> dict[str, Any]:
        """Generate and parse a JSON-structured response."""
        ...


class BaseAgent(ABC):
    """Shared base for all investigation agents."""

    name: str = "base_agent"

    def __init__(self, llm: LLMClient | None = None) -> None:
        self.llm = llm
        # TODO: Inject tools, prompt loaders, and shared run context.

    @abstractmethod
    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        """
        Execute the agent against the shared investigation context.

        Returns a partial update to merge into the pipeline state.
        """
        ...


class GeminiLLMClient:
    """
    Placeholder Google Gemini API client.

    TODO: Implement with google-generativeai using GEMINI_API_KEY.
    TODO: Add retries, safety settings, and structured-output helpers.
    """

    def __init__(self, api_key: str | None = None, model: str = "gemini-2.0-flash") -> None:
        self.api_key = api_key
        self.model = model
        # TODO: Initialize the Gemini SDK client.

    async def generate(self, prompt: str, **kwargs: Any) -> str:
        # TODO: Call Gemini generateContent.
        raise NotImplementedError("GeminiLLMClient.generate is not implemented yet.")

    async def generate_json(self, prompt: str, **kwargs: Any) -> dict[str, Any]:
        # TODO: Call Gemini and parse JSON (or use response schema).
        raise NotImplementedError("GeminiLLMClient.generate_json is not implemented yet.")
