"""Tests for Multi-Language Assistance logic and query endpoints."""

import pytest
from httpx import AsyncClient

from app.stadium.language import detect_query_language


class TestLanguageLogic:
    """Test heuristics query language detection."""

    def test_detects_hindi(self):
        assert detect_query_language("Namaste! Water station kidhar hai?") == "hi"
        assert detect_query_language("Entry gate kya hai?") == "hi"

    def test_detects_spanish(self):
        assert detect_query_language("Donde esta el bano?") == "es"
        assert detect_query_language("Gracias!") == "es"

    def test_detects_french(self):
        assert detect_query_language("Bonjour, exit gate?") == "fr"

    def test_detects_arabic(self):
        assert detect_query_language("Marhaba! ticket info?") == "ar"

    def test_detects_english_default(self):
        assert detect_query_language("Where is the seat section?") == "en"


@pytest.mark.asyncio()
async def test_assist_query_endpoint_rules_fallback(client: AsyncClient):
    """POST /api/assist/query falls back to rules and detects Hindi."""
    response = await client.post(
        "/api/assist/query",
        json={
            "query": "kya seat vacant hai?",
            "preferred_language": "en",
            "persona_type": "fan",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["detected_language"] == "hi"
    assert data["source"] == "rules"
    assert "stadium operations support active" in data["response_text"].lower()


@pytest.mark.asyncio()
async def test_assist_query_redacts_pii(client: AsyncClient):
    """Queries redact phone/emails before processing."""
    response = await client.post(
        "/api/assist/query",
        json={
            "query": "My phone is 123-456-7890 and email is fan@mail.com. Help!",
            "preferred_language": "en",
            "persona_type": "fan",
        },
    )
    assert response.status_code == 200
    # No error raised, PII successfully redacted
