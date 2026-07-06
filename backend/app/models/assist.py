"""Pydantic v2 schemas for Multi-Language Assistance (Feature 9)."""

from pydantic import BaseModel, Field


class AssistRequest(BaseModel):
    """Request schema for persona-aware multilingual assistant queries."""

    query: str = Field(..., min_length=1, max_length=500, description="User query text")
    preferred_language: str = Field(
        default="en", min_length=2, max_length=10, description="Desired ISO language code"
    )
    persona_type: str = Field(
        default="fan", description="Target audience: fan, organizer, volunteer, staff"
    )
    context: str = Field(default="", max_length=500, description="Additional context info")


class AssistResponse(BaseModel):
    """Response schema containing query replies and meta parameters."""

    response_text: str = Field(..., description="Response translation or query reply")
    detected_language: str = Field(..., description="Auto-detected query language ISO code")
    persona_type: str = Field(..., description="Audience category")
    source: str = Field(..., description="Source engine: gemini or rules")
