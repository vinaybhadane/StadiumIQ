"""Test fixtures and configuration for StadiumIQ backend tests.

Uses create_app() factory pattern for test isolation.
All Google Cloud services are mocked.
"""

import os
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# Ensure all GCP services are disabled for tests
os.environ["USE_GEMINI"] = "false"
os.environ["USE_FIRESTORE"] = "false"
os.environ["USE_BIGQUERY"] = "false"
os.environ["USE_PUBSUB"] = "false"

from app.main import create_app


@pytest.fixture()
def app():
    """Create a fresh app instance for each test."""
    return create_app()


@pytest_asyncio.fixture()
async def client(app) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client using the app factory."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
