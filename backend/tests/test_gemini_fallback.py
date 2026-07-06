"""Tests for Gemini service fallback — 3 failure modes tested.

1. NetworkError (service unavailable)
2. JSONDecodeError (invalid response)
3. TimeoutError (request timeout)
"""

import json
from unittest.mock import MagicMock

import pytest

from app.services.gemini_service import (
    GeminiUnavailableError,
    generate_insight,
)


@pytest.mark.asyncio()
async def test_gemini_disabled_raises():
    """When USE_GEMINI=false, GeminiUnavailableError is raised."""
    with pytest.raises(GeminiUnavailableError, match="disabled"):
        await generate_insight("test prompt")


@pytest.mark.asyncio()
async def test_gemini_network_error():
    """Network error triggers GeminiUnavailableError."""
    import app.services.gemini_service as svc

    # Temporarily set a mock model that raises
    original = svc._model
    mock_model = MagicMock()
    mock_model.generate_content.side_effect = ConnectionError("Network down")
    svc._model = mock_model

    try:
        with pytest.raises(GeminiUnavailableError, match="failed"):
            await generate_insight("test prompt")
    finally:
        svc._model = original


@pytest.mark.asyncio()
async def test_gemini_json_decode_error():
    """Invalid JSON from Gemini triggers GeminiUnavailableError."""
    import app.services.gemini_service as svc

    original = svc._model
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "This is not valid JSON"
    mock_model.generate_content.return_value = mock_response
    svc._model = mock_model

    try:
        with pytest.raises(GeminiUnavailableError, match="invalid JSON"):
            await generate_insight("test prompt")
    finally:
        svc._model = original


@pytest.mark.asyncio()
async def test_gemini_timeout_error():
    """Timeout triggers GeminiUnavailableError."""
    import app.services.gemini_service as svc

    original = svc._model
    mock_model = MagicMock()
    mock_model.generate_content.side_effect = TimeoutError("Request timed out")
    svc._model = mock_model

    try:
        with pytest.raises(GeminiUnavailableError, match="timed out"):
            await generate_insight("test prompt")
    finally:
        svc._model = original


@pytest.mark.asyncio()
async def test_gemini_success_returns_dict():
    """Successful Gemini call returns parsed JSON dict."""
    import app.services.gemini_service as svc

    original = svc._model
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = json.dumps({"insights": [{"title": "Test Insight"}]})
    mock_model.generate_content.return_value = mock_response
    svc._model = mock_model

    try:
        result = await generate_insight("test prompt")
        assert isinstance(result, dict)
        assert "insights" in result
    finally:
        svc._model = original


@pytest.mark.asyncio()
async def test_gemini_helpers_success_and_fail():
    """Test other Gemini helpers success and fail cases."""
    from unittest.mock import MagicMock

    import app.services.gemini_service as svc

    original = svc._model
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "Mocked Text response"
    mock_model.generate_content.return_value = mock_response
    svc._model = mock_model

    try:
        # 1. generate_schedule_optimization (returns dict because it parses JSON)
        mock_response.text = '{"schedule": []}'
        res_sched = await svc.generate_schedule_optimization("optimize")
        assert "schedule" in res_sched

        # 2. generate_tactical_briefing (returns text)
        mock_response.text = "Briefing Text"
        res_brief = await svc.generate_tactical_briefing("briefing context")
        assert res_brief == "Briefing Text"

        # 3. generate_tournament_summary (returns text)
        mock_response.text = "Summary Text"
        res_sum = await svc.generate_tournament_summary("summary context")
        assert res_sum == "Summary Text"

        # 4. generate_navigation_directions (returns text)
        mock_response.text = "Navigate left"
        res_nav = await svc.generate_navigation_directions("Z1", "restroom")
        assert res_nav == "Navigate left"

        # 5. generate_multilingual_assistance
        mock_response.text = '{"response_text": "Hi", "detected_language": "en"}'
        res_ast = await svc.generate_multilingual_assistance("hi", "en", "fan")
        assert res_ast["response_text"] == "Hi"

        # Now test exception branches
        mock_model.generate_content.side_effect = RuntimeError("Service error")

        with pytest.raises(svc.GeminiUnavailableError):
            await svc.generate_tactical_briefing("fail")

        with pytest.raises(svc.GeminiUnavailableError):
            await svc.generate_tournament_summary("fail")

        with pytest.raises(svc.GeminiUnavailableError):
            await svc.generate_navigation_directions("Z1", "exit")

        with pytest.raises(svc.GeminiUnavailableError):
            await svc.generate_multilingual_assistance("fail", "en", "fan")

    finally:
        svc._model = original
