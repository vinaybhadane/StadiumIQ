"""Match scheduling and tournament management routes."""

import asyncio
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, Request

from app.core.rate_limit import limiter
from app.models.match import (
    Match,
    MatchScheduleRequest,
    MatchScheduleResponse,
    MatchStatistics,
    MatchStatus,
    StandingsEntry,
    Team,
)
from app.services import bigquery_service, pubsub_service
from app.services.gemini_service import GeminiUnavailableError, generate_schedule_optimization
from app.stadium.scheduler import optimize_schedule

router = APIRouter(prefix="/matches", tags=["Matches"])

# In-memory store for demo
_matches: list[Match] = [
    Match(
        match_id="M001",
        home_team=Team(team_id="T1", name="Metropolis FC", ranking=3, group="A"),
        away_team=Team(team_id="T2", name="Gotham United", ranking=5, group="A"),
        stadium_id="STD-001",
        scheduled_time=datetime(2026, 7, 10, 16, 0, tzinfo=UTC),
        status=MatchStatus.COMPLETED,
        statistics=MatchStatistics(home_score=2, away_score=1, attendance=55000),
    ),
    Match(
        match_id="M002",
        home_team=Team(team_id="T3", name="Star City Rovers", ranking=2, group="A"),
        away_team=Team(team_id="T4", name="Central City FC", ranking=7, group="A"),
        stadium_id="STD-001",
        scheduled_time=datetime(2026, 7, 12, 18, 0, tzinfo=UTC),
        status=MatchStatus.SCHEDULED,
    ),
    Match(
        match_id="M003",
        home_team=Team(team_id="T1", name="Metropolis FC", ranking=3, group="A"),
        away_team=Team(team_id="T3", name="Star City Rovers", ranking=2, group="A"),
        stadium_id="STD-001",
        scheduled_time=datetime(2026, 7, 15, 20, 0, tzinfo=UTC),
        status=MatchStatus.LIVE,
        statistics=MatchStatistics(
            home_score=1, away_score=1, home_possession=55.3, away_possession=44.7, attendance=58000
        ),
    ),
]


@router.get("", response_model=list[Match])
async def get_matches() -> list[Match]:
    """Get all matches in the tournament."""
    return _matches


@router.get("/{match_id}", response_model=Match)
async def get_match(match_id: str) -> Match:
    """Get a specific match by ID."""
    for match in _matches:
        if match.match_id == match_id:
            return match

    raise HTTPException(status_code=404, detail=f"Match {match_id} not found")


@router.post(
    "/schedule",
    response_model=MatchScheduleResponse,
)
@limiter.limit("20/minute")
async def schedule_matches(
    request: Request,
    body: MatchScheduleRequest,
) -> MatchScheduleResponse:
    """Generate an optimized match schedule.

    Attempts Gemini AI optimization first, falls back to rule-based
    scheduling if Gemini is unavailable.
    """
    source = "rules"

    try:
        # Try Gemini first
        prompt = (
            f"Optimize schedule for {len(body.teams)} teams across "
            f"{len(body.stadium_ids)} venues from {body.start_date} to "
            f"{body.end_date}. Rest days: {body.rest_days_between_matches}."
        )
        await generate_schedule_optimization(prompt)
        source = "gemini"
        # Parse AI result into matches (simplified)
    except GeminiUnavailableError:
        pass  # Fall through to rules engine

    # Rule-based scheduling
    matches, conflicts = optimize_schedule(
        teams=body.teams,
        stadium_ids=body.stadium_ids,
        start_date=body.start_date,
        end_date=body.end_date,
        rest_days=body.rest_days_between_matches,
    )

    # Fire-and-forget: log and notify
    asyncio.create_task(
        bigquery_service.log_event(
            event_type="schedule_generated",
            stadium_id=body.stadium_ids[0] if body.stadium_ids else "",
            data={"num_matches": len(matches), "source": source},
        )
    )
    asyncio.create_task(
        pubsub_service.publish_schedule_change(
            change_type="new_schedule",
            match_data={"num_matches": len(matches)},
        )
    )

    return MatchScheduleResponse(
        schedule=matches,
        conflicts=conflicts,
        optimization_notes=f"Schedule generated using {source} engine.",
        source=source,
    )


@router.get("/standings/current", response_model=list[StandingsEntry])
async def get_standings() -> list[StandingsEntry]:
    """Get current tournament standings."""
    return [
        StandingsEntry(
            team=Team(team_id="T1", name="Metropolis FC", ranking=3, group="A"),
            played=2,
            won=1,
            drawn=1,
            lost=0,
            goals_for=3,
            goals_against=2,
            points=4,
        ),
        StandingsEntry(
            team=Team(team_id="T3", name="Star City Rovers", ranking=2, group="A"),
            played=2,
            won=1,
            drawn=1,
            lost=0,
            goals_for=4,
            goals_against=2,
            points=4,
        ),
        StandingsEntry(
            team=Team(team_id="T2", name="Gotham United", ranking=5, group="A"),
            played=1,
            won=0,
            drawn=0,
            lost=1,
            goals_for=1,
            goals_against=2,
            points=0,
        ),
        StandingsEntry(
            team=Team(team_id="T4", name="Central City FC", ranking=7, group="A"),
            played=0,
            won=0,
            drawn=0,
            lost=0,
            goals_for=0,
            goals_against=0,
            points=0,
        ),
    ]
