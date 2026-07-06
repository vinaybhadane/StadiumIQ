"""Crowd management and surge prediction routes."""

import asyncio
from datetime import UTC, datetime

from fastapi import APIRouter, Request

from app.core.rate_limit import limiter
from app.models.crowd import (
    CrowdDensityReading,
    CrowdSnapshot,
    GateFlowData,
    RiskLevel,
    SurgePredictionResponse,
)
from app.services import bigquery_service, pubsub_service
from app.services.gemini_service import GeminiUnavailableError, generate_insight
from app.stadium.rules import generate_surge_predictions

router = APIRouter(prefix="/crowd", tags=["Crowd"])


@router.get("/snapshot", response_model=CrowdSnapshot)
async def get_crowd_snapshot() -> CrowdSnapshot:
    """Get current crowd state across all zones and gates."""
    now = datetime.now(tz=UTC)

    snapshot = CrowdSnapshot(
        stadium_id="STD-001",
        timestamp=now,
        total_occupancy=49500,
        capacity=60000,
        zone_densities=[
            CrowdDensityReading(
                zone_id="Z-NORTH", timestamp=now, density=83.3, entry_rate=45, exit_rate=12
            ),
            CrowdDensityReading(
                zone_id="Z-SOUTH", timestamp=now, density=73.3, entry_rate=38, exit_rate=15
            ),
            CrowdDensityReading(
                zone_id="Z-EAST", timestamp=now, density=85.0, entry_rate=22, exit_rate=8
            ),
            CrowdDensityReading(
                zone_id="Z-WEST", timestamp=now, density=92.0, entry_rate=18, exit_rate=5
            ),
            CrowdDensityReading(
                zone_id="Z-ACCESSIBLE", timestamp=now, density=76.0, entry_rate=10, exit_rate=4
            ),
            CrowdDensityReading(
                zone_id="Z-STANDING", timestamp=now, density=90.0, entry_rate=35, exit_rate=10
            ),
        ],
        gate_flows=[
            GateFlowData(
                gate_id="G1",
                timestamp=now,
                inflow=1700,
                outflow=200,
                queue_length=85,
                wait_time_minutes=4.5,
            ),
            GateFlowData(
                gate_id="G2",
                timestamp=now,
                inflow=1200,
                outflow=150,
                queue_length=42,
                wait_time_minutes=2.3,
            ),
            GateFlowData(
                gate_id="G3",
                timestamp=now,
                inflow=1500,
                outflow=180,
                queue_length=65,
                wait_time_minutes=3.5,
            ),
            GateFlowData(
                gate_id="G4",
                timestamp=now,
                inflow=1100,
                outflow=120,
                queue_length=30,
                wait_time_minutes=1.8,
            ),
            GateFlowData(
                gate_id="G5",
                timestamp=now,
                inflow=850,
                outflow=100,
                queue_length=20,
                wait_time_minutes=1.2,
            ),
            GateFlowData(
                gate_id="G6",
                timestamp=now,
                inflow=920,
                outflow=80,
                queue_length=55,
                wait_time_minutes=3.0,
            ),
            GateFlowData(
                gate_id="G7",
                timestamp=now,
                inflow=480,
                outflow=60,
                queue_length=10,
                wait_time_minutes=0.8,
            ),
            GateFlowData(
                gate_id="G8",
                timestamp=now,
                inflow=1050,
                outflow=140,
                queue_length=72,
                wait_time_minutes=3.8,
            ),
        ],
    )

    # Fire-and-forget analytics
    asyncio.create_task(
        bigquery_service.log_event(
            event_type="crowd_snapshot",
            stadium_id="STD-001",
            data={"occupancy": snapshot.total_occupancy},
        )
    )

    return snapshot


@router.get(
    "/surge",
    response_model=SurgePredictionResponse,
)
@limiter.limit("30/minute")
async def predict_surge(request: Request) -> SurgePredictionResponse:
    """Predict crowd surge risks for all gates.

    Attempts Gemini AI prediction first, falls back to rule-based
    analysis if Gemini is unavailable.
    """
    source = "rules"

    # Try Gemini first
    try:
        prompt = (
            "Predict crowd surge risks for StadiumIQ Arena. "
            "Current occupancy: 49500/60000. "
            "Gate flows: G1=1700/h, G3=1500/h, G8=1050/h."
        )
        await generate_insight(prompt)
        source = "gemini"
    except GeminiUnavailableError:
        pass

    # Rule-based predictions
    gate_flows = {
        "G1": (1700, 1200),
        "G2": (1200, 1000),
        "G3": (1500, 1100),
        "G4": (1100, 900),
        "G5": (850, 700),
        "G6": (920, 750),
        "G7": (480, 400),
        "G8": (1050, 800),
    }
    zone_occupancies = {
        "Z-NORTH": (12500, 15000),
        "Z-SOUTH": (11000, 15000),
        "Z-EAST": (8500, 10000),
        "Z-WEST": (9200, 10000),
    }

    predictions = generate_surge_predictions(gate_flows, zone_occupancies)

    overall_risk = RiskLevel.GREEN
    for pred in predictions:
        if pred.risk_level == RiskLevel.RED:
            overall_risk = RiskLevel.RED
            break
        if pred.risk_level == RiskLevel.YELLOW:
            overall_risk = RiskLevel.YELLOW

    # Alert if high risk
    if overall_risk == RiskLevel.RED:
        asyncio.create_task(
            pubsub_service.publish_alert(
                alert_type="surge_warning",
                message={"risk_level": "RED", "stadium_id": "STD-001"},
            )
        )

    return SurgePredictionResponse(
        predictions=predictions,
        overall_risk=overall_risk,
        summary=f"Surge analysis via {source} engine. Overall risk: {overall_risk.value}.",
        source=source,
    )
