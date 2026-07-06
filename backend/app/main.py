"""StadiumIQ FastAPI application factory.

Uses the create_app() factory pattern for clean test isolation
and configurable middleware registration.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.core.security import SecurityHeadersMiddleware
from app.routes.analytics import router as analytics_router
from app.routes.assist import router as assist_router
from app.routes.crowd import router as crowd_router
from app.routes.health import router as health_router
from app.routes.insights import router as insights_router
from app.routes.matches import router as matches_router
from app.routes.navigation import router as navigation_router
from app.routes.stadium import router as stadium_router


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    Returns a fully configured FastAPI instance with:
    - CORS middleware
    - Security headers middleware (8 headers)
    - Rate limiting (slowapi)
    - All route prefixes mounted
    """
    settings = get_settings()

    app = FastAPI(
        title="StadiumIQ",
        description="AI-Powered Smart Stadium & Tournament Intelligence Platform",
        version="1.0.0",
        docs_url="/api/docs" if settings.app_env == "development" else None,
        redoc_url="/api/redoc" if settings.app_env == "development" else None,
    )

    # --- Middleware ---
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins.split(","),
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "Accept"],
    )

    # --- Rate Limiting ---
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

    # --- Routes ---
    app.include_router(health_router, prefix="/api")
    app.include_router(stadium_router, prefix="/api")
    app.include_router(matches_router, prefix="/api")
    app.include_router(crowd_router, prefix="/api")
    app.include_router(insights_router, prefix="/api")
    app.include_router(analytics_router, prefix="/api")
    app.include_router(navigation_router, prefix="/api")
    app.include_router(assist_router, prefix="/api")

    # --- Static Files (Frontend) ---
    if os.path.exists("static"):
        app.mount("/", StaticFiles(directory="static", html=True), name="static")

    return app
