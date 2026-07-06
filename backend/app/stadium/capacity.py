"""Pure functions for stadium capacity calculations.

All functions are pure (zero I/O, zero side effects) for easy testing.
"""

from app.models.crowd import RiskLevel


def calculate_zone_density(current_occupancy: int, capacity: int) -> float:
    """Calculate zone density as a percentage.

    Args:
        current_occupancy: Number of people currently in the zone.
        capacity: Maximum capacity of the zone.

    Returns:
        Density percentage (0.0 to 100.0).

    Raises:
        ValueError: If capacity <= 0 or occupancy < 0.
    """
    if capacity <= 0:
        raise ValueError("Capacity must be positive")
    if current_occupancy < 0:
        raise ValueError("Occupancy cannot be negative")
    return round((current_occupancy / capacity) * 100, 2)


def calculate_gate_distribution(
    total_expected: int,
    gate_capacities: dict[str, int],
) -> dict[str, int]:
    """Distribute expected crowd across gates proportional to capacity.

    Args:
        total_expected: Total number of expected attendees.
        gate_capacities: Mapping of gate_id to throughput capacity per hour.

    Returns:
        Mapping of gate_id to allocated crowd count.

    Raises:
        ValueError: If total_expected < 0 or no gates provided.
    """
    if total_expected < 0:
        raise ValueError("Expected crowd count cannot be negative")
    if not gate_capacities:
        raise ValueError("At least one gate must be provided")

    total_capacity = sum(gate_capacities.values())
    if total_capacity == 0:
        # Equal distribution if all capacities are zero
        equal_share = total_expected // len(gate_capacities)
        return dict.fromkeys(gate_capacities, equal_share)

    distribution: dict[str, int] = {}
    allocated = 0
    gate_ids = list(gate_capacities.keys())

    for gate_id in gate_ids[:-1]:
        share = round(total_expected * gate_capacities[gate_id] / total_capacity)
        distribution[gate_id] = share
        allocated += share

    # Last gate gets the remainder to avoid rounding errors
    distribution[gate_ids[-1]] = total_expected - allocated
    return distribution


def calculate_surge_risk(
    current_inflow: int,
    average_inflow: int,
    capacity: int,
    current_occupancy: int,
) -> RiskLevel:
    """Determine surge risk level based on current conditions.

    Risk levels:
    - GREEN: Normal flow, occupancy < 70%
    - YELLOW: Elevated flow OR occupancy 70-85%
    - RED: High flow AND occupancy > 85%

    Args:
        current_inflow: Current people entering per minute.
        average_inflow: Historical average inflow per minute.
        capacity: Maximum zone/gate capacity.
        current_occupancy: Current number of people.

    Returns:
        RiskLevel enum value.
    """
    if capacity <= 0:
        return RiskLevel.RED

    occupancy_pct = (current_occupancy / capacity) * 100
    flow_ratio = current_inflow / average_inflow if average_inflow > 0 else 1.0

    if occupancy_pct > 85 and flow_ratio > 1.5:
        return RiskLevel.RED
    if occupancy_pct > 70 or flow_ratio > 1.3:
        return RiskLevel.YELLOW
    return RiskLevel.GREEN


def calculate_evacuation_time(
    total_occupancy: int,
    exit_capacities: dict[str, int],
    safety_factor: float = 1.5,
) -> dict[str, float]:
    """Calculate estimated evacuation time through each exit.

    Args:
        total_occupancy: Total people to evacuate.
        exit_capacities: Mapping of exit_id to people per minute capacity.
        safety_factor: Multiplier for conservative estimate (default 1.5).

    Returns:
        Mapping of exit_id to estimated evacuation time in minutes.

    Raises:
        ValueError: If total_occupancy < 0 or safety_factor <= 0.
    """
    if total_occupancy < 0:
        raise ValueError("Total occupancy cannot be negative")
    if safety_factor <= 0:
        raise ValueError("Safety factor must be positive")
    if not exit_capacities:
        return {}

    total_exit_capacity = sum(exit_capacities.values())
    if total_exit_capacity == 0:
        return {exit_id: float("inf") for exit_id in exit_capacities}

    evacuation_times: dict[str, float] = {}
    for exit_id, exit_cap in exit_capacities.items():
        if exit_cap <= 0:
            evacuation_times[exit_id] = float("inf")
            continue
        # Each exit handles a proportional share
        share = total_occupancy * (exit_cap / total_exit_capacity)
        time_minutes = (share / exit_cap) * safety_factor
        evacuation_times[exit_id] = round(time_minutes, 2)

    return evacuation_times


def calculate_overall_capacity_score(
    zone_occupancies: list[tuple[int, int]],
) -> float:
    """Calculate a weighted overall capacity utilization score.

    Args:
        zone_occupancies: List of (current_occupancy, capacity) tuples.

    Returns:
        Weighted average occupancy percentage (0.0 to 100.0).
    """
    if not zone_occupancies:
        return 0.0

    total_occupancy = sum(occ for occ, _ in zone_occupancies)
    total_capacity = sum(cap for _, cap in zone_occupancies)

    if total_capacity == 0:
        return 0.0

    return round((total_occupancy / total_capacity) * 100, 2)
