"""Integration tests for all API routes.

All Google Cloud services are mocked via environment variables
set in conftest.py (USE_*=false).
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio()
async def test_health_check(client: AsyncClient):
    """GET /api/health returns healthy status."""
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"
    assert data["services"]["gemini"] is False
    assert data["services"]["firestore"] is False


@pytest.mark.asyncio()
async def test_get_stadium(client: AsyncClient):
    """GET /api/stadium returns demo stadium data."""
    response = await client.get("/api/stadium")
    assert response.status_code == 200
    data = response.json()
    assert data["stadium_id"] == "STD-001"
    assert data["total_capacity"] == 60000
    assert len(data["zones"]) == 6
    assert len(data["gates"]) == 8


@pytest.mark.asyncio()
async def test_get_digital_twin(client: AsyncClient):
    """GET /api/stadium/twin returns Digital Twin data."""
    response = await client.get("/api/stadium/twin")
    assert response.status_code == 200
    data = response.json()
    assert data["stadium_id"] == "STD-001"
    assert "zones" in data
    assert "gates" in data


@pytest.mark.asyncio()
async def test_create_stadium(client: AsyncClient):
    """POST /api/stadium creates a new stadium."""
    response = await client.post(
        "/api/stadium",
        json={"name": "Test Arena", "city": "TestCity", "total_capacity": 30000},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Arena"
    assert data["total_capacity"] == 30000


@pytest.mark.asyncio()
async def test_create_stadium_validation(client: AsyncClient):
    """POST /api/stadium rejects invalid data."""
    response = await client.post(
        "/api/stadium",
        json={"name": "", "city": "TestCity", "total_capacity": -1},
    )
    assert response.status_code == 422


@pytest.mark.asyncio()
async def test_get_matches(client: AsyncClient):
    """GET /api/matches returns match list."""
    response = await client.get("/api/matches")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3


@pytest.mark.asyncio()
async def test_get_match_by_id(client: AsyncClient):
    """GET /api/matches/{id} returns specific match."""
    response = await client.get("/api/matches/M001")
    assert response.status_code == 200
    data = response.json()
    assert data["match_id"] == "M001"


@pytest.mark.asyncio()
async def test_get_match_not_found(client: AsyncClient):
    """GET /api/matches/{id} returns 404 for unknown match."""
    response = await client.get("/api/matches/UNKNOWN")
    assert response.status_code == 404


@pytest.mark.asyncio()
async def test_get_standings(client: AsyncClient):
    """GET /api/matches/standings/current returns standings."""
    response = await client.get("/api/matches/standings/current")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4


@pytest.mark.asyncio()
async def test_get_crowd_snapshot(client: AsyncClient):
    """GET /api/crowd/snapshot returns crowd data."""
    response = await client.get("/api/crowd/snapshot")
    assert response.status_code == 200
    data = response.json()
    assert data["stadium_id"] == "STD-001"
    assert "zone_densities" in data
    assert "gate_flows" in data


@pytest.mark.asyncio()
async def test_get_surge_prediction(client: AsyncClient):
    """GET /api/crowd/surge returns surge predictions."""
    response = await client.get("/api/crowd/surge")
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert "overall_risk" in data
    assert data["source"] == "rules"


@pytest.mark.asyncio()
async def test_get_latest_insights(client: AsyncClient):
    """GET /api/insights/latest returns pre-generated insights."""
    response = await client.get("/api/insights/latest")
    assert response.status_code == 200
    data = response.json()
    assert len(data["insights"]) >= 3


@pytest.mark.asyncio()
async def test_post_insights(client: AsyncClient):
    """POST /api/insights generates insights (rules fallback)."""
    response = await client.post(
        "/api/insights",
        json={
            "stadium_id": "STD-001",
            "context": "Match day crowd management",
            "categories": ["crowd_management"],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "rules"
    assert len(data["insights"]) > 0


@pytest.mark.asyncio()
async def test_get_attendance_trends(client: AsyncClient):
    """GET /api/analytics/attendance returns trend data."""
    response = await client.get("/api/analytics/attendance")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


@pytest.mark.asyncio()
async def test_security_headers(client: AsyncClient):
    """All responses include required security headers."""
    response = await client.get("/api/health")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "max-age=31536000" in response.headers.get("Strict-Transport-Security", "")
    assert response.headers.get("Cross-Origin-Opener-Policy") == "same-origin"
    assert "Content-Security-Policy" in response.headers
    assert "Permissions-Policy" in response.headers
    assert "Referrer-Policy" in response.headers


@pytest.mark.asyncio()
async def test_schedule_matches_gemini_success(client: AsyncClient):
    """POST /api/matches/schedule with mock Gemini success."""
    from unittest.mock import AsyncMock

    import app.routes.matches as matches_route

    original = matches_route.generate_schedule_optimization
    matches_route.generate_schedule_optimization = AsyncMock(
        return_value={"schedule": [], "conflicts": [], "optimization_notes": "Optimized by Gemini"}
    )

    try:
        response = await client.post(
            "/api/matches/schedule",
            json={
                "teams": [
                    {"team_id": "T1", "name": "Team A", "ranking": 1},
                    {"team_id": "T2", "name": "Team B", "ranking": 2},
                ],
                "stadium_ids": ["STD-001"],
                "start_date": "2026-07-10T16:00:00Z",
                "end_date": "2026-07-20T16:00:00Z",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["source"] == "gemini"
    finally:
        matches_route.generate_schedule_optimization = original


@pytest.mark.asyncio()
async def test_generate_insights_gemini_success(client: AsyncClient):
    """POST /api/insights with mock Gemini success."""
    from unittest.mock import AsyncMock

    import app.routes.insights as insights_route

    original = insights_route.generate_insight
    insights_route.generate_insight = AsyncMock(
        return_value={
            "insights": [
                {"title": "AI Insight 1", "description": "High load", "recommendation": "Open Gate"}
            ]
        }
    )

    try:
        response = await client.post(
            "/api/insights",
            json={
                "stadium_id": "STD-001",
                "context": "Context",
                "categories": ["crowd_management"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["source"] == "gemini"
        assert len(data["insights"]) == 1
    finally:
        insights_route.generate_insight = original


@pytest.mark.asyncio()
async def test_get_directions_gemini_success(client: AsyncClient):
    """POST /api/navigation/directions with mock Gemini success."""
    from unittest.mock import AsyncMock

    import app.routes.navigation as nav_route

    original = nav_route.generate_navigation_directions
    nav_route.generate_navigation_directions = AsyncMock(
        return_value="Follow the VIP ramp on the East."
    )

    try:
        response = await client.post(
            "/api/navigation/directions",
            json={
                "current_zone": "Z-NORTH",
                "destination_type": "restroom",
                "accessibility_required": True,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "Follow the VIP ramp" in data["gemini_instructions"]
    finally:
        nav_route.generate_navigation_directions = original


@pytest.mark.asyncio()
async def test_assist_query_gemini_success(client: AsyncClient):
    """POST /api/assist/query with mock Gemini success."""
    from unittest.mock import AsyncMock

    import app.routes.assist as assist_route

    original = assist_route.generate_multilingual_assistance
    assist_route.generate_multilingual_assistance = AsyncMock(
        return_value={"response_text": "Translated message in Hindi", "detected_language": "hi"}
    )

    try:
        response = await client.post(
            "/api/assist/query",
            json={
                "query": "kya seat vacant hai?",
                "preferred_language": "hi",
                "persona_type": "fan",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["source"] == "gemini"
        assert data["response_text"] == "Translated message in Hindi"
    finally:
        assist_route.generate_multilingual_assistance = original


@pytest.mark.asyncio()
async def test_get_tournament_summary_gemini_success(client: AsyncClient):
    """POST /api/analytics with mock Gemini success."""
    from unittest.mock import AsyncMock

    import app.routes.analytics as analytics_route

    original = analytics_route.generate_tournament_summary
    analytics_route.generate_tournament_summary = AsyncMock(return_value="Gemini summary text.")

    try:
        response = await client.post("/api/analytics")
        assert response.status_code == 200
        data = response.json()
        assert data["source"] == "gemini"
        assert data["ai_summary"] == "Gemini summary text."
    finally:
        analytics_route.generate_tournament_summary = original
