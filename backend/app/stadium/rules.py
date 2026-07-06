"""Rule-based AI fallback engine.

Provides deterministic insights and recommendations when Gemini is
unavailable. These functions are used as the fallback logic layer.
"""

from datetime import UTC, datetime

from app.models.crowd import RiskLevel, SurgePrediction
from app.models.insights import (
    Insight,
    InsightCategory,
    InsightPriority,
)
from app.stadium.capacity import calculate_surge_risk


def generate_crowd_insights(
    occupancy_percentage: float,
    gate_utilizations: dict[str, float],
) -> list[Insight]:
    """Generate rule-based crowd management insights.

    Args:
        occupancy_percentage: Overall stadium occupancy (0-100).
        gate_utilizations: Mapping of gate_id to utilization percentage.

    Returns:
        List of rule-based insights.
    """
    insights: list[Insight] = []
    now = datetime.now(tz=UTC)

    if occupancy_percentage > 85:
        insights.append(
            Insight(
                insight_id=f"CROWD-{now.strftime('%H%M%S')}-001",
                category=InsightCategory.CROWD_MANAGEMENT,
                priority=InsightPriority.HIGH,
                title="High Stadium Occupancy Alert",
                description=(
                    f"Stadium occupancy is at {occupancy_percentage:.1f}%. "
                    "Consider activating overflow management protocols."
                ),
                recommendation=(
                    "Open additional gates, deploy extra staff to "
                    "high-density zones, and prepare overflow areas."
                ),
                generated_at=now,
                source="rules",
                confidence=0.9,
            )
        )
    elif occupancy_percentage > 70:
        insights.append(
            Insight(
                insight_id=f"CROWD-{now.strftime('%H%M%S')}-002",
                category=InsightCategory.CROWD_MANAGEMENT,
                priority=InsightPriority.MEDIUM,
                title="Moderate Occupancy — Monitor Closely",
                description=(
                    f"Stadium occupancy is at {occupancy_percentage:.1f}%. "
                    "Approaching high-density threshold."
                ),
                recommendation="Increase monitoring frequency. Pre-position staff.",
                generated_at=now,
                source="rules",
                confidence=0.85,
            )
        )

    # Gate-specific insights
    for gate_id, utilization in gate_utilizations.items():
        if utilization > 90:
            insights.append(
                Insight(
                    insight_id=f"GATE-{gate_id}-{now.strftime('%H%M%S')}",
                    category=InsightCategory.CROWD_MANAGEMENT,
                    priority=InsightPriority.HIGH,
                    title=f"Gate {gate_id} Near Capacity",
                    description=(
                        f"Gate {gate_id} is at {utilization:.1f}% utilization. "
                        "Bottleneck risk is high."
                    ),
                    recommendation=(
                        f"Redirect crowd to alternative gates. "
                        f"Deploy additional staff to gate {gate_id}."
                    ),
                    generated_at=now,
                    source="rules",
                    confidence=0.88,
                )
            )

    return insights


def generate_surge_predictions(
    gate_flows: dict[str, tuple[int, int]],
    zone_occupancies: dict[str, tuple[int, int]],
) -> list[SurgePrediction]:
    """Generate rule-based surge predictions.

    Args:
        gate_flows: Mapping of gate_id to (current_inflow, average_inflow).
        zone_occupancies: Mapping of zone_id to (current_occupancy, capacity).

    Returns:
        List of surge predictions.
    """
    predictions: list[SurgePrediction] = []
    now = datetime.now(tz=UTC)

    for gate_id, (current_flow, avg_flow) in gate_flows.items():
        # Find the zone connected to this gate (simplified: first zone)
        zone_id = list(zone_occupancies.keys())[0] if zone_occupancies else "unknown"
        occupancy, capacity = zone_occupancies.get(zone_id, (0, 1))

        risk = calculate_surge_risk(current_flow, avg_flow, capacity, occupancy)

        action = ""
        if risk == RiskLevel.RED:
            action = f"Immediately deploy crowd control to gate {gate_id}."
        elif risk == RiskLevel.YELLOW:
            action = f"Pre-position staff near gate {gate_id}."

        predictions.append(
            SurgePrediction(
                gate_id=gate_id,
                zone_id=zone_id,
                predicted_peak_time=now,
                risk_level=risk,
                expected_inflow=current_flow,
                confidence=0.75,
                recommended_action=action,
            )
        )

    return predictions


def generate_resource_recommendations(
    total_occupancy: int,
    total_capacity: int,
    num_medical_stations: int,
    num_staff: int,
) -> list[Insight]:
    """Generate rule-based staff and resource recommendations.

    Args:
        total_occupancy: Current total occupancy.
        total_capacity: Maximum capacity.
        num_medical_stations: Current medical stations deployed.
        num_staff: Current staff deployed.

    Returns:
        List of resource optimization insights.
    """
    insights: list[Insight] = []
    now = datetime.now(tz=UTC)

    # Staff ratio: 1 per 250 attendees minimum
    recommended_staff = max(1, total_occupancy // 250)
    if num_staff < recommended_staff:
        insights.append(
            Insight(
                insight_id=f"STAFF-{now.strftime('%H%M%S')}",
                category=InsightCategory.RESOURCE_OPTIMIZATION,
                priority=InsightPriority.HIGH
                if num_staff < recommended_staff // 2
                else InsightPriority.MEDIUM,
                title="Insufficient Staff Deployment",
                description=(
                    f"Current staff: {num_staff}. Recommended: {recommended_staff} "
                    f"(1 per 250 attendees at {total_occupancy} occupancy)."
                ),
                recommendation=f"Deploy {recommended_staff - num_staff} additional staff members.",
                generated_at=now,
                source="rules",
                confidence=0.9,
            )
        )

    # Medical stations: 1 per 5000 attendees
    recommended_medical = max(1, total_occupancy // 5000)
    if num_medical_stations < recommended_medical:
        insights.append(
            Insight(
                insight_id=f"MEDICAL-{now.strftime('%H%M%S')}",
                category=InsightCategory.SAFETY,
                priority=InsightPriority.HIGH,
                title="Additional Medical Stations Needed",
                description=(
                    f"Current medical stations: {num_medical_stations}. "
                    f"Recommended: {recommended_medical} for {total_occupancy} attendees."
                ),
                recommendation=(
                    f"Activate {recommended_medical - num_medical_stations} "
                    "additional medical stations."
                ),
                generated_at=now,
                source="rules",
                confidence=0.92,
            )
        )

    return insights


def generate_match_briefing(
    home_team_name: str,
    away_team_name: str,
    home_recent_form: list[str],
    away_recent_form: list[str],
) -> str:
    """Generate a rule-based pre-match tactical briefing.

    Args:
        home_team_name: Name of the home team.
        away_team_name: Name of the away team.
        home_recent_form: Recent results like ["W", "L", "D", "W", "W"].
        away_recent_form: Recent results like ["L", "W", "W", "D", "L"].

    Returns:
        Formatted briefing string.
    """

    def form_summary(form: list[str]) -> str:
        wins = form.count("W")
        draws = form.count("D")
        losses = form.count("L")
        return f"{wins}W-{draws}D-{losses}L in last {len(form)} matches"

    home_summary = form_summary(home_recent_form) if home_recent_form else "No recent data"
    away_summary = form_summary(away_recent_form) if away_recent_form else "No recent data"

    return (
        f"Pre-Match Briefing: {home_team_name} vs {away_team_name}\n"
        f"{'=' * 50}\n"
        f"Home Form: {home_summary}\n"
        f"Away Form: {away_summary}\n"
        f"\nKey Factors:\n"
        f"- Home advantage is statistically significant\n"
        f"- Recent form suggests "
        f"{'home' if home_recent_form.count('W') >= away_recent_form.count('W') else 'away'} "
        f"team has momentum\n"
        f"\n[Generated by StadiumIQ Rules Engine]"
    )


def generate_persona_decision_support(persona_type: str, context: str = "") -> list[Insight]:
    """Generate rule-based decision support recommendations for a persona.

    Covers Fans, Organizers, Volunteers, and On-Ground Staff.
    """
    insights: list[Insight] = []
    now = datetime.now(tz=UTC)

    if persona_type == "organizer":
        insights.append(
            Insight(
                insight_id=f"DECIDE-ORG-{now.strftime('%H%M%S')}-001",
                category=InsightCategory.RESOURCE_OPTIMIZATION,
                priority=InsightPriority.MEDIUM,
                title="Organizer Duty: Staff Dispatch Needed",
                description="Gate C is nearing 95% capacity. Crowd density at West stand is elevated.",
                recommendation="Direct 5 standby ticket scanners to open Gate D bypass queues.",
                generated_at=now,
                source="rules",
                confidence=0.9,
            )
        )
    elif persona_type == "volunteer":
        insights.append(
            Insight(
                insight_id=f"DECIDE-VOL-{now.strftime('%H%M%S')}-001",
                category=InsightCategory.CROWD_MANAGEMENT,
                priority=InsightPriority.LOW,
                title="Volunteer Duty: Inflow Guidance",
                description="High influx detected at North Gate G1.",
                recommendation="Deploy to North Entry zone to assist fans with ticket scanning.",
                generated_at=now,
                source="rules",
                confidence=0.85,
            )
        )
    elif persona_type == "staff":
        insights.append(
            Insight(
                insight_id=f"DECIDE-STF-{now.strftime('%H%M%S')}-001",
                category=InsightCategory.SAFETY,
                priority=InsightPriority.HIGH,
                title="On-Ground Staff: Incident Triage",
                description="Obstruction reported in evacuation passageway at West Stand stairs.",
                recommendation="Clear debris immediately. Pre-position medical crew in adjacent Zone Z-WEST.",
                generated_at=now,
                source="rules",
                confidence=0.95,
            )
        )
    elif persona_type == "fan":
        insights.append(
            Insight(
                insight_id=f"DECIDE-FAN-{now.strftime('%H%M%S')}-001",
                category=InsightCategory.REVENUE,
                priority=InsightPriority.LOW,
                title="Fan Recommendation: Concession Deal",
                description="West stand concessions are currently experiencing long queues (10+ min wait).",
                recommendation="Visit East Stand food court for shorter wait times (<3 min) and express payment lanes.",
                generated_at=now,
                source="rules",
                confidence=0.88,
            )
        )

    return insights
