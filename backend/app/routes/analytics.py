"""Tournament analytics routes."""

import asyncio
from datetime import UTC, datetime

from fastapi import APIRouter, Request

from app.core.rate_limit import limiter
from app.models.insights import AttendanceTrend, TournamentSummary
from app.services import bigquery_service
from app.services.gemini_service import (
    GeminiUnavailableError,
    generate_tournament_summary,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.post(
    "",
    response_model=TournamentSummary,
)
@limiter.limit("15/minute")
async def get_tournament_summary(request: Request) -> TournamentSummary:
    """Generate a tournament analytics summary.

    Uses Gemini AI for narrative summary, falls back to
    data-only summary if unavailable.
    """
    ai_summary = ""
    source = "rules"

    try:
        ai_summary = await generate_tournament_summary(
            "Summarize the StadiumIQ Cup 2026 tournament so far. "
            "3 matches played, avg attendance 54000, 2 teams tied at top."
        )
        source = "gemini"
    except GeminiUnavailableError:
        ai_summary = (
            "StadiumIQ Cup 2026 — Tournament Summary\n"
            "3 matches completed. Average attendance: 54,000 (90% capacity). "
            "Metropolis FC and Star City Rovers lead Group A with 4 points each. "
            "Gate G1 has highest throughput. West Premium Stand consistently fills first."
        )

    summary = TournamentSummary(
        tournament_name="StadiumIQ Cup 2026",
        total_matches=3,
        total_attendance=162000,
        average_attendance=54000.0,
        revenue_summary={
            "gate_revenue": 4860000.0,
            "concessions": 1215000.0,
            "vip_packages": 850000.0,
        },
        highlights=[
            "Metropolis FC vs Gotham United drew 55,000 attendance",
            "Star City Rovers have the best goal difference (+2)",
            "Gate G1 processed 35% of all entries",
            "West Premium Stand sold out in all 3 matches",
        ],
        ai_summary=ai_summary,
        source=source,
    )

    # Fire-and-forget analytics
    asyncio.create_task(
        bigquery_service.log_event(
            event_type="tournament_summary_generated",
            stadium_id="STD-001",
            data={"source": source, "total_matches": 3},
        )
    )

    return summary


@router.get("/attendance", response_model=list[AttendanceTrend])
async def get_attendance_trends() -> list[AttendanceTrend]:
    """Get attendance trend data across matches."""
    return [
        AttendanceTrend(
            match_id="M001",
            date=datetime(2026, 7, 10, 16, 0, tzinfo=UTC),
            attendance=55000,
            capacity=60000,
            gate_revenue=1650000.0,
        ),
        AttendanceTrend(
            match_id="M003",
            date=datetime(2026, 7, 15, 20, 0, tzinfo=UTC),
            attendance=58000,
            capacity=60000,
            gate_revenue=1740000.0,
        ),
        AttendanceTrend(
            match_id="M005",
            date=datetime(2026, 7, 18, 18, 0, tzinfo=UTC),
            attendance=49000,
            capacity=60000,
            gate_revenue=1470000.0,
        ),
    ]
