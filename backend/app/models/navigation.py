"""Pydantic v2 schemas for Smart Indoor Navigation (Feature 8)."""

from pydantic import BaseModel, Field


class NavigationRequest(BaseModel):
    """Request schema for indoor wayfinding instructions."""

    current_zone: str = Field(
        ..., min_length=1, max_length=50, description="User's starting zone ID"
    )
    destination_type: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Target location category (restroom, exit, concession, etc.)",
    )
    accessibility_required: bool = Field(
        default=False, description="Whether to prioritize step-free routes"
    )


class NavigationResponse(BaseModel):
    """Response schema detailing direction pathways."""

    path_steps: list[str] = Field(..., description="Ordered list of zones to traverse")
    estimated_time_minutes: float = Field(..., ge=0, description="Projected traversal time")
    gemini_instructions: str = Field(
        ..., description="Gemini-generated natural language wayfinding descriptions"
    )
    accessibility_note: str = Field(
        default="", description="Additional safety information for accessibility requirements"
    )
