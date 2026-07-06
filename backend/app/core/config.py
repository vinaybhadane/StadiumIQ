"""Application configuration using Pydantic Settings.

All Google Cloud services are disabled by default (USE_*=false)
so the app can run fully offline for local development and testing.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """StadiumIQ application settings with feature flags for GCP services."""

    # Application
    app_env: str = "development"
    port: int = 8080
    cors_origins: str = "http://localhost:5173"

    # Google Cloud Project
    gcp_project_id: str = "local-dev"

    # Feature Flags — all disabled by default for offline operation
    use_gemini: bool = False
    use_firestore: bool = False
    use_bigquery: bool = False
    use_pubsub: bool = False

    # Vertex AI / Gemini
    gemini_model: str = "gemini-1.5-flash"
    gemini_location: str = "us-central1"

    # Firestore
    firestore_database: str = "(default)"

    # BigQuery
    bigquery_dataset: str = "stadium_analytics"

    # Pub/Sub
    pubsub_topic_alerts: str = "stadium-alerts"
    pubsub_topic_schedule: str = "stadium-schedule-changes"

    # Rate Limits
    rate_limit_insights: str = "10/minute"
    rate_limit_schedule: str = "20/minute"
    rate_limit_crowd: str = "30/minute"
    rate_limit_analytics: str = "15/minute"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


# Lazy singleton — only created when first accessed
_settings: Settings | None = None


def get_settings() -> Settings:
    """Return the application settings singleton (lazy init)."""
    global _settings  # noqa: PLW0603
    if _settings is None:
        _settings = Settings()
    return _settings
