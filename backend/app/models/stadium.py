"""Pydantic v2 models for stadium configuration and zones."""

from enum import StrEnum

from pydantic import BaseModel, Field


class ZoneType(StrEnum):
    """Stadium zone classification."""

    GENERAL = "general"
    VIP = "vip"
    PREMIUM = "premium"
    STANDING = "standing"
    ACCESSIBLE = "accessible"


class GateStatus(StrEnum):
    """Gate operational status."""

    OPEN = "open"
    CLOSED = "closed"
    RESTRICTED = "restricted"
    EMERGENCY_ONLY = "emergency_only"


class StadiumZone(BaseModel):
    """Individual zone within a stadium."""

    zone_id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    zone_type: ZoneType
    capacity: int = Field(..., gt=0, le=100_000)
    current_occupancy: int = Field(default=0, ge=0)
    gates: list[str] = Field(default_factory=list)

    @property
    def occupancy_percentage(self) -> float:
        """Calculate current occupancy as a percentage."""
        if self.capacity == 0:
            return 0.0
        return round((self.current_occupancy / self.capacity) * 100, 2)


class Gate(BaseModel):
    """Stadium gate with status and throughput tracking."""

    gate_id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    status: GateStatus = GateStatus.OPEN
    capacity_per_hour: int = Field(default=1000, gt=0)
    current_throughput: int = Field(default=0, ge=0)
    is_emergency_exit: bool = False
    connected_zones: list[str] = Field(default_factory=list)

    @property
    def utilization_percentage(self) -> float:
        """Calculate gate utilization as a percentage."""
        if self.capacity_per_hour == 0:
            return 0.0
        return round((self.current_throughput / self.capacity_per_hour) * 100, 2)


class Stadium(BaseModel):
    """Complete stadium configuration."""

    stadium_id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=200)
    city: str = Field(..., min_length=1, max_length=100)
    total_capacity: int = Field(..., gt=0, le=500_000)
    zones: list[StadiumZone] = Field(default_factory=list)
    gates: list[Gate] = Field(default_factory=list)

    @property
    def total_occupancy(self) -> int:
        """Sum of all zone occupancies."""
        return sum(zone.current_occupancy for zone in self.zones)

    @property
    def overall_occupancy_percentage(self) -> float:
        """Overall stadium occupancy percentage."""
        if self.total_capacity == 0:
            return 0.0
        return round((self.total_occupancy / self.total_capacity) * 100, 2)


class StadiumCreate(BaseModel):
    """Schema for creating a new stadium."""

    name: str = Field(..., min_length=1, max_length=200)
    city: str = Field(..., min_length=1, max_length=100)
    total_capacity: int = Field(..., gt=0, le=500_000)


class StadiumResponse(BaseModel):
    """API response schema for stadium data."""

    stadium_id: str
    name: str
    city: str
    total_capacity: int
    total_occupancy: int
    overall_occupancy_percentage: float
    zones: list[StadiumZone]
    gates: list[Gate]
