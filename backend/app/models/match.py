"""Pydantic v2 models for match scheduling and tournament standings."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class MatchStatus(StrEnum):
    """Match lifecycle status."""

    SCHEDULED = "scheduled"
    LIVE = "live"
    HALF_TIME = "half_time"
    COMPLETED = "completed"
    POSTPONED = "postponed"
    CANCELLED = "cancelled"


class WeatherCondition(StrEnum):
    """Weather conditions that affect match scheduling."""

    CLEAR = "clear"
    CLOUDY = "cloudy"
    RAINY = "rainy"
    STORMY = "stormy"
    EXTREME_HEAT = "extreme_heat"
    SNOW = "snow"


class Team(BaseModel):
    """Team information."""

    team_id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    ranking: int = Field(default=0, ge=0)
    group: str = Field(default="", max_length=10)


class MatchStatistics(BaseModel):
    """In-match statistics."""

    home_score: int = Field(default=0, ge=0)
    away_score: int = Field(default=0, ge=0)
    home_possession: float = Field(default=50.0, ge=0.0, le=100.0)
    away_possession: float = Field(default=50.0, ge=0.0, le=100.0)
    home_shots: int = Field(default=0, ge=0)
    away_shots: int = Field(default=0, ge=0)
    attendance: int = Field(default=0, ge=0)


class Match(BaseModel):
    """Complete match record."""

    match_id: str = Field(..., min_length=1, max_length=50)
    home_team: Team
    away_team: Team
    stadium_id: str = Field(..., min_length=1, max_length=50)
    scheduled_time: datetime
    status: MatchStatus = MatchStatus.SCHEDULED
    weather: WeatherCondition = WeatherCondition.CLEAR
    broadcast_window: str = Field(default="", max_length=50)
    statistics: MatchStatistics = Field(default_factory=MatchStatistics)


class MatchScheduleRequest(BaseModel):
    """Request schema for AI match scheduling optimization."""

    teams: list[Team] = Field(..., min_length=2)
    stadium_ids: list[str] = Field(..., min_length=1)
    start_date: datetime
    end_date: datetime
    broadcast_windows: list[str] = Field(default_factory=list)
    weather_forecasts: list[WeatherCondition] = Field(default_factory=list)
    rest_days_between_matches: int = Field(default=2, ge=1, le=7)


class MatchScheduleResponse(BaseModel):
    """Response schema for AI-generated match schedule."""

    schedule: list[Match]
    conflicts: list[str] = Field(default_factory=list)
    optimization_notes: str = ""
    source: str = Field(default="rules", description="'gemini' or 'rules'")


class StandingsEntry(BaseModel):
    """Tournament standings row."""

    team: Team
    played: int = Field(default=0, ge=0)
    won: int = Field(default=0, ge=0)
    drawn: int = Field(default=0, ge=0)
    lost: int = Field(default=0, ge=0)
    goals_for: int = Field(default=0, ge=0)
    goals_against: int = Field(default=0, ge=0)
    points: int = Field(default=0, ge=0)

    @property
    def goal_difference(self) -> int:
        """Calculate goal difference."""
        return self.goals_for - self.goals_against
