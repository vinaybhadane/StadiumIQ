"""Tests for Smart Indoor Navigation logic and route endpoints."""

import pytest
from httpx import AsyncClient

from app.stadium.navigation import calculate_directions, find_shortest_path


class TestNavigationLogic:
    """Test pure path calculation routing logic."""

    def test_shortest_path_direct(self):
        assert find_shortest_path("Z-NORTH", "Z-NORTH") == ["Z-NORTH"]

    def test_shortest_path_simple(self):
        path = find_shortest_path("Z-NORTH", "Z-EAST")
        assert path == ["Z-NORTH", "Z-EAST"]

    def test_shortest_path_multi_hop(self):
        path = find_shortest_path("Z-ACCESSIBLE", "Z-WEST")
        # Z-ACCESSIBLE -> Z-EAST -> Z-NORTH (or Z-SOUTH) -> Z-WEST
        assert len(path) >= 4
        assert path[0] == "Z-ACCESSIBLE"
        assert path[-1] == "Z-WEST"

    def test_accessibility_restricted_path(self):
        # Normal path Z-NORTH -> Z-STANDING -> Z-WEST
        # Wheelchair accessible path should avoid Z-STANDING (accessible_required=True)
        path_accessible = find_shortest_path("Z-NORTH", "Z-WEST", accessibility_required=True)
        assert "Z-STANDING" not in path_accessible

    def test_calculate_directions_concession(self):
        path, est_time, note = calculate_directions("Z-NORTH", "concession")
        assert len(path) > 0
        assert est_time > 0
        assert note == ""

    def test_calculate_directions_accessible(self):
        _, _, note = calculate_directions("Z-NORTH", "exit", accessibility_required=True)
        assert "Elevator" in note


@pytest.mark.asyncio()
async def test_navigation_directions_endpoint(client: AsyncClient):
    """POST /api/navigation/directions returns valid path coordinates."""
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
    assert "path_steps" in data
    assert "estimated_time_minutes" in data
    assert "gemini_instructions" in data
    assert "accessibility_note" in data
    assert "Elevator" in data["accessibility_note"]
