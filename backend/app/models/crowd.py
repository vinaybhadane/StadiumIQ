"""Pydantic v2 models for crowd management and surge prediction."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class RiskLevel(StrEnum):
    """Crowd surge risk classification."""

    GREEN = "green"
    YELLOW = "yellow"
    RED = "red"


class CrowdDensityReading(BaseModel):
    """Single crowd density measurement for a zone."""

    zone_id: str = Field(..., min_length=1, max_length=50)
    timestamp: datetime
    density: float = Field(..., ge=0.0, le=100.0, description="Percentage of capacity")
    entry_rate: int = Field(default=0, ge=0, description="People entering per minute")
    exit_rate: int = Field(default=0, ge=0, description="People exiting per minute")


class GateFlowData(BaseModel):
    """Gate-level flow data for surge analysis."""

    gate_id: str = Field(..., min_length=1, max_length=50)
    timestamp: datetime
    inflow: int = Field(default=0, ge=0)
    outflow: int = Field(default=0, ge=0)
    queue_length: int = Field(default=0, ge=0)
    wait_time_minutes: float = Field(default=0.0, ge=0.0)


class SurgePrediction(BaseModel):
    """Crowd surge prediction for a specific gate/zone."""

    gate_id: str
    zone_id: str
    predicted_peak_time: datetime
    risk_level: RiskLevel
    expected_inflow: int = Field(..., ge=0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    recommended_action: str = ""


class SurgePredictionRequest(BaseModel):
    """Request schema for crowd surge prediction."""

    stadium_id: str = Field(..., min_length=1, max_length=50)
    match_id: str = Field(..., min_length=1, max_length=50)
    current_ticket_sales: int = Field(..., ge=0)
    historical_attendance: list[int] = Field(default_factory=list)
    gate_ids: list[str] = Field(default_factory=list)


class SurgePredictionResponse(BaseModel):
    """Response schema for crowd surge prediction."""

    predictions: list[SurgePrediction]
    overall_risk: RiskLevel
    summary: str = ""
    source: str = Field(default="rules", description="'gemini' or 'rules'")


class CrowdSnapshot(BaseModel):
    """Complete crowd state at a point in time."""

    stadium_id: str
    timestamp: datetime
    total_occupancy: int = Field(..., ge=0)
    capacity: int = Field(..., gt=0)
    zone_densities: list[CrowdDensityReading] = Field(default_factory=list)
    gate_flows: list[GateFlowData] = Field(default_factory=list)

    @property
    def occupancy_percentage(self) -> float:
        """Overall occupancy percentage."""
        return round((self.total_occupancy / self.capacity) * 100, 2)
