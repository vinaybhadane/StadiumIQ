"""Pydantic v2 models for AI-generated insights and analytics."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class InsightCategory(str, Enum):
    """Categories of AI-generated insights."""

    CROWD_MANAGEMENT = "crowd_management"
    SCHEDULING = "scheduling"
    RESOURCE_OPTIMIZATION = "resource_optimization"
    SAFETY = "safety"
    PERFORMANCE = "performance"
    REVENUE = "revenue"


class InsightPriority(str, Enum):
    """Insight urgency classification."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Insight(BaseModel):
    """AI-generated insight or recommendation."""

    insight_id: str = Field(..., min_length=1, max_length=50)
    category: InsightCategory
    priority: InsightPriority
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    recommendation: str = Field(default="", max_length=1000)
    generated_at: datetime
    source: str = Field(default="rules", description="'gemini' or 'rules'")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class InsightRequest(BaseModel):
    """Request schema for generating AI insights."""

    stadium_id: str = Field(..., min_length=1, max_length=50)
    match_id: str = Field(default="", max_length=50)
    context: str = Field(default="", max_length=500)
    categories: list[InsightCategory] = Field(default_factory=list)


class InsightResponse(BaseModel):
    """Response schema for AI insights."""

    insights: list[Insight]
    source: str = Field(default="rules", description="'gemini' or 'rules'")


class AnalyticsEvent(BaseModel):
    """Analytics event for BigQuery logging."""

    event_id: str = Field(..., min_length=1, max_length=50)
    event_type: str = Field(..., min_length=1, max_length=50)
    stadium_id: str = Field(..., min_length=1, max_length=50)
    match_id: str = Field(default="", max_length=50)
    timestamp: datetime
    data: dict[str, str | int | float | bool] = Field(default_factory=dict)


class TournamentSummary(BaseModel):
    """AI-generated tournament summary report."""

    tournament_name: str = Field(..., min_length=1, max_length=200)
    total_matches: int = Field(..., ge=0)
    total_attendance: int = Field(..., ge=0)
    average_attendance: float = Field(..., ge=0.0)
    revenue_summary: dict[str, float] = Field(default_factory=dict)
    highlights: list[str] = Field(default_factory=list)
    ai_summary: str = Field(default="", max_length=5000)
    source: str = Field(default="rules", description="'gemini' or 'rules'")


class AttendanceTrend(BaseModel):
    """Attendance data point for trend analysis."""

    match_id: str
    date: datetime
    attendance: int = Field(..., ge=0)
    capacity: int = Field(..., gt=0)
    gate_revenue: float = Field(default=0.0, ge=0.0)

    @property
    def fill_rate(self) -> float:
        """Calculate fill rate as percentage."""
        return round((self.attendance / self.capacity) * 100, 2)
