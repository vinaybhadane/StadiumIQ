"""Smart Indoor Navigation routes (Feature 8)."""

from fastapi import APIRouter, Request

from app.core.rate_limit import NAVIGATION_LIMIT, limiter
from app.models.navigation import NavigationRequest, NavigationResponse
from app.services.gemini_service import GeminiUnavailableError, generate_navigation_directions
from app.stadium.navigation import calculate_directions

router = APIRouter(prefix="/navigation", tags=["Navigation"])


@router.post(
    "/directions",
    response_model=NavigationResponse,
)
@limiter.limit(NAVIGATION_LIMIT)
async def get_directions(
    request: Request,
    body: NavigationRequest,
) -> NavigationResponse:
    """Calculate egress routes and wayfinding steps.

    Uses Gemini to generate natural instructions first, falling back
    to rule-based BFS paths if Vertex AI is offline.
    """
    # 1. Base pure function routing calculations
    path, est_time, access_note = calculate_directions(
        body.current_zone,
        body.destination_type,
        body.accessibility_required,
    )

    gemini_instructions = ""

    # 2. Try Gemini instructions first
    try:
        gemini_instructions = await generate_navigation_directions(
            body.current_zone,
            body.destination_type,
        )
    except GeminiUnavailableError:
        # Static fallback description
        if path:
            gemini_instructions = (
                f"Head from your location towards {path[0]}. "
                f"Cross {' -> '.join(path[1:])} to arrive at the {body.destination_type} area."
            )
        else:
            gemini_instructions = "No directions could be computed at this time."

    return NavigationResponse(
        path_steps=path,
        estimated_time_minutes=est_time,
        gemini_instructions=gemini_instructions,
        accessibility_note=access_note,
    )
