"""AI insights generation routes."""

import asyncio
from datetime import UTC, datetime

from fastapi import APIRouter, Request

from app.core.rate_limit import limiter
from app.models.insights import (
    Insight,
    InsightCategory,
    InsightPriority,
    InsightRequest,
    InsightResponse,
)
from app.services import bigquery_service
from app.services.gemini_service import GeminiUnavailableError, generate_insight
from app.stadium.rules import generate_crowd_insights, generate_resource_recommendations

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.post(
    "",
    response_model=InsightResponse,
)
@limiter.limit("10/minute")
async def generate_insights(
    request: Request,
    body: InsightRequest,
) -> InsightResponse:
    """Generate AI-powered insights for stadium operations.

    Attempts Gemini AI first, falls back to rule-based insights
    if Gemini is unavailable.
    """
    source = "rules"
    insights: list[Insight] = []

    # Try Gemini first
    try:
        prompt = (
            f"Generate stadium operation insights for stadium {body.stadium_id}. "
            f"Context: {body.context}. "
            f"Categories: {[c.value for c in body.categories]}."
        )
        ai_result = await generate_insight(prompt)
        source = "gemini"

        # Parse AI insights
        if isinstance(ai_result.get("insights"), list):
            for idx, item in enumerate(ai_result["insights"]):
                insights.append(
                    Insight(
                        insight_id=f"AI-{datetime.now(tz=UTC).strftime('%H%M%S')}-{idx:03d}",
                        category=InsightCategory.CROWD_MANAGEMENT,
                        priority=InsightPriority.MEDIUM,
                        title=item.get("title", "AI Insight"),
                        description=item.get("description", ""),
                        recommendation=item.get("recommendation", ""),
                        generated_at=datetime.now(tz=UTC),
                        source="gemini",
                        confidence=0.85,
                    )
                )
    except GeminiUnavailableError:
        pass

    # If no Gemini insights, use rules engine
    if not insights:
        # Crowd management insights
        crowd_insights = generate_crowd_insights(
            occupancy_percentage=82.5,
            gate_utilizations={
                "G1": 85.0,
                "G3": 75.0,
                "G6": 92.0,
                "G8": 87.5,
            },
        )
        insights.extend(crowd_insights)

        # Resource recommendations
        resource_insights = generate_resource_recommendations(
            total_occupancy=49500,
            total_capacity=60000,
            num_medical_stations=8,
            num_staff=150,
        )
        insights.extend(resource_insights)

    # Fire-and-forget analytics
    asyncio.create_task(
        bigquery_service.log_event(
            event_type="insights_generated",
            stadium_id=body.stadium_id,
            data={"count": len(insights), "source": source},
        )
    )

    return InsightResponse(insights=insights, source=source)


@router.get("/latest", response_model=InsightResponse)
async def get_latest_insights() -> InsightResponse:
    """Get the most recent pre-generated insights."""
    now = datetime.now(tz=UTC)

    return InsightResponse(
        insights=[
            Insight(
                insight_id="LATEST-001",
                category=InsightCategory.CROWD_MANAGEMENT,
                priority=InsightPriority.HIGH,
                title="West Premium Stand Near Capacity",
                description="Zone Z-WEST is at 92% occupancy. Gate G6 showing high utilization.",
                recommendation="Open additional entry points. Redirect crowd from Gate G6 to Gate G5.",
                generated_at=now,
                source="rules",
                confidence=0.9,
            ),
            Insight(
                insight_id="LATEST-002",
                category=InsightCategory.SAFETY,
                priority=InsightPriority.MEDIUM,
                title="Standing Zone Monitoring Required",
                description="Zone Z-STANDING at 90% capacity. Entry rate exceeds exit rate.",
                recommendation="Deploy additional stewards. Monitor for crush risk.",
                generated_at=now,
                source="rules",
                confidence=0.88,
            ),
            Insight(
                insight_id="LATEST-003",
                category=InsightCategory.RESOURCE_OPTIMIZATION,
                priority=InsightPriority.MEDIUM,
                title="Staff Rebalancing Recommended",
                description="South stand has lower occupancy but standard staffing. North stand is understaffed.",
                recommendation="Move 5 staff from South Stand to North Stand during half-time.",
                generated_at=now,
                source="rules",
                confidence=0.82,
            ),
        ],
        source="rules",
    )
