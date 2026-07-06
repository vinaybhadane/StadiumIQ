"""Multi-Language Assistance routes (Feature 9)."""

from fastapi import APIRouter, Request

from app.core.rate_limit import ASSIST_LIMIT, limiter
from app.core.safety import sanitize_for_prompt
from app.models.assist import AssistRequest, AssistResponse
from app.services.gemini_service import GeminiUnavailableError, generate_multilingual_assistance
from app.stadium.language import detect_query_language

router = APIRouter(prefix="/assist", tags=["Assist"])


@router.post(
    "/query",
    response_model=AssistResponse,
)
@limiter.limit(ASSIST_LIMIT)
async def assist_query(
    request: Request,
    body: AssistRequest,
) -> AssistResponse:
    """Receive multi-lingual queries and return AI-generated responses.

    Strictly redacts PII before reaching Gemini.
    """
    # 1. Sanitize user queries
    sanitized_query = sanitize_for_prompt(body.query, max_length=500)

    # 2. Heuristics fallback language check
    detected_lang = detect_query_language(sanitized_query, body.preferred_language)

    response_text = ""
    source = "rules"

    # 3. Try Gemini first
    try:
        ai_res = await generate_multilingual_assistance(
            sanitized_query,
            detected_lang,
            body.persona_type,
        )
        response_text = ai_res.get("response_text", "")
        detected_lang = ai_res.get("detected_language", detected_lang)
        source = "gemini"
    except GeminiUnavailableError:
        # Fallback static query lookup responses
        if "gate" in sanitized_query.lower() or "entrance" in sanitized_query.lower():
            response_text = "Gate G1 is open on the north side, G3 on the south."
        else:
            response_text = (
                f"Stadium operations support active. "
                f"Your query was cataloged under {body.persona_type} category."
            )

    return AssistResponse(
        response_text=response_text,
        detected_language=detected_lang,
        persona_type=body.persona_type,
        source=source,
    )
