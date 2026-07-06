"""Stadium management routes.

Provides endpoints for stadium configuration, zone management,
and the Digital Stadium Twin data.
"""

import asyncio

from fastapi import APIRouter

from app.models.stadium import (
    Gate,
    GateStatus,
    Stadium,
    StadiumCreate,
    StadiumResponse,
    StadiumZone,
    ZoneType,
)
from app.services import bigquery_service

router = APIRouter(prefix="/stadium", tags=["Stadium"])

# In-memory store for demo (Firestore in production)
_stadiums: dict[str, Stadium] = {}


def _get_demo_stadium() -> Stadium:
    """Return a pre-configured demo stadium."""
    return Stadium(
        stadium_id="STD-001",
        name="StadiumIQ Arena",
        city="Metropolis",
        total_capacity=60000,
        zones=[
            StadiumZone(
                zone_id="Z-NORTH",
                name="North Stand",
                zone_type=ZoneType.GENERAL,
                capacity=15000,
                current_occupancy=12500,
                gates=["G1", "G2"],
            ),
            StadiumZone(
                zone_id="Z-SOUTH",
                name="South Stand",
                zone_type=ZoneType.GENERAL,
                capacity=15000,
                current_occupancy=11000,
                gates=["G3", "G4"],
            ),
            StadiumZone(
                zone_id="Z-EAST",
                name="East VIP Stand",
                zone_type=ZoneType.VIP,
                capacity=10000,
                current_occupancy=8500,
                gates=["G5"],
            ),
            StadiumZone(
                zone_id="Z-WEST",
                name="West Premium Stand",
                zone_type=ZoneType.PREMIUM,
                capacity=10000,
                current_occupancy=9200,
                gates=["G6"],
            ),
            StadiumZone(
                zone_id="Z-ACCESSIBLE",
                name="Accessible Section",
                zone_type=ZoneType.ACCESSIBLE,
                capacity=5000,
                current_occupancy=3800,
                gates=["G7"],
            ),
            StadiumZone(
                zone_id="Z-STANDING",
                name="Standing Zone",
                zone_type=ZoneType.STANDING,
                capacity=5000,
                current_occupancy=4500,
                gates=["G8"],
            ),
        ],
        gates=[
            Gate(
                gate_id="G1",
                name="Gate 1 - North Main",
                capacity_per_hour=2000,
                current_throughput=1700,
                connected_zones=["Z-NORTH"],
            ),
            Gate(
                gate_id="G2",
                name="Gate 2 - North Side",
                capacity_per_hour=1500,
                current_throughput=1200,
                connected_zones=["Z-NORTH"],
            ),
            Gate(
                gate_id="G3",
                name="Gate 3 - South Main",
                capacity_per_hour=2000,
                current_throughput=1500,
                connected_zones=["Z-SOUTH"],
            ),
            Gate(
                gate_id="G4",
                name="Gate 4 - South Side",
                capacity_per_hour=1500,
                current_throughput=1100,
                connected_zones=["Z-SOUTH"],
            ),
            Gate(
                gate_id="G5",
                name="Gate 5 - East VIP",
                capacity_per_hour=1000,
                current_throughput=850,
                status=GateStatus.OPEN,
                connected_zones=["Z-EAST"],
            ),
            Gate(
                gate_id="G6",
                name="Gate 6 - West Premium",
                capacity_per_hour=1000,
                current_throughput=920,
                connected_zones=["Z-WEST"],
            ),
            Gate(
                gate_id="G7",
                name="Gate 7 - Accessible",
                capacity_per_hour=800,
                current_throughput=480,
                connected_zones=["Z-ACCESSIBLE"],
                is_emergency_exit=True,
            ),
            Gate(
                gate_id="G8",
                name="Gate 8 - Standing",
                capacity_per_hour=1200,
                current_throughput=1050,
                connected_zones=["Z-STANDING"],
                is_emergency_exit=True,
            ),
        ],
    )


@router.get("", response_model=StadiumResponse)
async def get_stadium() -> StadiumResponse:
    """Get the current stadium configuration and live status."""
    stadium = _stadiums.get("STD-001", _get_demo_stadium())

    # Fire-and-forget analytics
    asyncio.create_task(
        bigquery_service.log_event(
            event_type="stadium_view",
            stadium_id=stadium.stadium_id,
            data={"occupancy": stadium.total_occupancy},
        )
    )

    return StadiumResponse(
        stadium_id=stadium.stadium_id,
        name=stadium.name,
        city=stadium.city,
        total_capacity=stadium.total_capacity,
        total_occupancy=stadium.total_occupancy,
        overall_occupancy_percentage=stadium.overall_occupancy_percentage,
        zones=stadium.zones,
        gates=stadium.gates,
    )


@router.post("", response_model=StadiumResponse, status_code=201)
async def create_stadium(body: StadiumCreate) -> StadiumResponse:
    """Create a new stadium configuration."""
    stadium_id = f"STD-{len(_stadiums) + 1:03d}"
    stadium = Stadium(
        stadium_id=stadium_id,
        name=body.name,
        city=body.city,
        total_capacity=body.total_capacity,
    )
    _stadiums[stadium_id] = stadium

    return StadiumResponse(
        stadium_id=stadium.stadium_id,
        name=stadium.name,
        city=stadium.city,
        total_capacity=stadium.total_capacity,
        total_occupancy=stadium.total_occupancy,
        overall_occupancy_percentage=stadium.overall_occupancy_percentage,
        zones=stadium.zones,
        gates=stadium.gates,
    )


@router.get("/twin", response_model=StadiumResponse)
async def get_digital_twin() -> StadiumResponse:
    """Get the Digital Stadium Twin data — real-time virtual replica.

    Returns the complete stadium state including all zone densities,
    gate utilizations, and occupancy data for 3D visualization.
    """
    stadium = _stadiums.get("STD-001", _get_demo_stadium())

    return StadiumResponse(
        stadium_id=stadium.stadium_id,
        name=stadium.name,
        city=stadium.city,
        total_capacity=stadium.total_capacity,
        total_occupancy=stadium.total_occupancy,
        overall_occupancy_percentage=stadium.overall_occupancy_percentage,
        zones=stadium.zones,
        gates=stadium.gates,
    )
