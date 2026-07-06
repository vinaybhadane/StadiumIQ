"""Gemini AI service via Vertex AI.

Lazy initialization — the Vertex AI client is only created on first call.
Provides graceful degradation: when Gemini is unavailable, raises
GeminiUnavailableError so the caller can fall back to rule-based logic.
"""

import json
import logging
from typing import Any

import vertexai
from vertexai.generative_models import GenerativeModel

from app.core.config import get_settings
from app.core.safety import sanitize_for_prompt

logger = logging.getLogger(__name__)


class GeminiUnavailableError(Exception):
    """Raised when Gemini cannot generate a response."""


_model: Any = None


def _get_model() -> Any:
    """Lazy-init the Vertex AI GenerativeModel client."""
    global _model  # noqa: PLW0603
    if _model is None:
        settings = get_settings()
        if not settings.use_gemini:
            raise GeminiUnavailableError("Gemini is disabled (USE_GEMINI=false)")

        vertexai.init(
            project=settings.gcp_project_id,
            location=settings.gemini_location,
        )
        _model = GenerativeModel(settings.gemini_model)
    return _model


async def generate_insight(prompt: str) -> dict[str, Any]:
    """Generate an AI insight using Gemini.

    Args:
        prompt: The prompt to send to Gemini (will be sanitized).

    Returns:
        Parsed JSON response from Gemini.

    Raises:
        GeminiUnavailableError: If Gemini cannot generate a response.
    """
    try:
        model = _get_model()
        sanitized_prompt = sanitize_for_prompt(prompt, max_length=500)

        response = model.generate_content(
            f"You are StadiumIQ, an AI assistant for smart stadium operations. "
            f"Respond ONLY with valid JSON.\n\n{sanitized_prompt}"
        )

        result: dict[str, Any] = json.loads(response.text)
        return result

    except GeminiUnavailableError:
        raise
    except json.JSONDecodeError as exc:
        logger.warning("Gemini returned invalid JSON: %s", exc)
        raise GeminiUnavailableError(f"Gemini returned invalid JSON: {exc}") from exc
    except TimeoutError as exc:
        logger.warning("Gemini request timed out: %s", exc)
        raise GeminiUnavailableError(f"Gemini request timed out: {exc}") from exc
    except Exception as exc:
        logger.warning("Gemini request failed: %s", exc)
        raise GeminiUnavailableError(f"Gemini request failed: {exc}") from exc


async def generate_schedule_optimization(prompt: str) -> dict[str, Any]:
    """Generate an optimized match schedule using Gemini.

    Args:
        prompt: Schedule optimization prompt (will be sanitized).

    Returns:
        Parsed JSON response with schedule recommendations.

    Raises:
        GeminiUnavailableError: If Gemini cannot generate a response.
    """
    return await generate_insight(f"Generate an optimized match schedule. {prompt}")


async def generate_tactical_briefing(prompt: str) -> str:
    """Generate a pre-match tactical briefing using Gemini.

    Args:
        prompt: Briefing context prompt (will be sanitized).

    Returns:
        Briefing text string.

    Raises:
        GeminiUnavailableError: If Gemini cannot generate a response.
    """
    try:
        model = _get_model()
        sanitized = sanitize_for_prompt(prompt, max_length=500)

        response = model.generate_content(
            f"You are StadiumIQ. Generate a concise pre-match tactical briefing.\n\n{sanitized}"
        )

        return str(response.text)

    except GeminiUnavailableError:
        raise
    except Exception as exc:
        logger.warning("Gemini briefing failed: %s", exc)
        raise GeminiUnavailableError(f"Gemini briefing failed: {exc}") from exc


async def generate_tournament_summary(prompt: str) -> str:
    """Generate a tournament summary report using Gemini.

    Args:
        prompt: Tournament data prompt (will be sanitized).

    Returns:
        Summary report text.

    Raises:
        GeminiUnavailableError: If Gemini cannot generate a response.
    """
    try:
        model = _get_model()
        sanitized = sanitize_for_prompt(prompt, max_length=500)

        response = model.generate_content(
            f"You are StadiumIQ. Generate a comprehensive tournament summary.\n\n{sanitized}"
        )

        return str(response.text)

    except GeminiUnavailableError:
        raise
    except Exception as exc:
        logger.warning("Gemini summary failed: %s", exc)
        raise GeminiUnavailableError(f"Gemini summary failed: {exc}") from exc


async def generate_navigation_directions(
    current_zone: str,
    destination_type: str,
    language: str = "en",
) -> str:
    """Generate step-by-step wayfinding instructions using Gemini.

    Args:
        current_zone: Source zone.
        destination_type: Target category.
        language: ISO language code.
    """
    try:
        model = _get_model()
        prompt = (
            f"Given stadium zone map and current crowd density, "
            f"generate step-by-step natural language navigation from "
            f"Zone {current_zone} to {destination_type} in {language}."
        )
        response = model.generate_content(prompt)
        return str(response.text)
    except GeminiUnavailableError:
        raise
    except Exception as exc:
        logger.warning("Gemini navigation directions failed: %s", exc)
        raise GeminiUnavailableError(f"Gemini navigation directions failed: {exc}") from exc


async def generate_multilingual_assistance(
    query: str,
    preferred_language: str,
    persona_type: str,
) -> dict[str, Any]:
    """Generate multilingual answers using Gemini.

    Args:
        query: User query.
        preferred_language: Output language.
        persona_type: Target audience.
    """
    try:
        prompt = (
            f"You are a multilingual stadium assistant. Persona: {persona_type}. "
            f"Respond in {preferred_language}. Query: {query}. "
            f'Return JSON format: {{"response_text": "...", "detected_language": "..."}}'
        )
        return await generate_insight(prompt)
    except GeminiUnavailableError:
        raise
    except Exception as exc:
        logger.warning("Gemini assistance failed: %s", exc)
        raise GeminiUnavailableError(f"Gemini assistance failed: {exc}") from exc
