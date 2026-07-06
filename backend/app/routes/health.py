"""Health check route.

Provides a simple health endpoint for Docker HEALTHCHECK
and load balancer probes.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import get_settings

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str
    version: str
    services: dict[str, bool]


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return application health status and enabled services."""
    settings = get_settings()
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        services={
            "gemini": settings.use_gemini,
            "firestore": settings.use_firestore,
            "bigquery": settings.use_bigquery,
            "pubsub": settings.use_pubsub,
        },
    )
