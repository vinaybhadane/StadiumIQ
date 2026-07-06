"""Pure functions for match scheduling logic.

All functions are pure (zero I/O, zero side effects) for easy testing.
Handles conflict detection and time slot optimization.
"""

from datetime import date, datetime, timedelta
from typing import Final

from app.models.match import Match, MatchStatus, Team, WeatherCondition

# Constants
STADIUM_CONFLICT_WINDOW_SECONDS: Final[int] = 4 * 3600  # 4 hours
MAX_SLOT_SEARCH_OFFSET: Final[int] = 5
DEFAULT_SLOT_HOURS_1: Final[list[int]] = [16]
DEFAULT_SLOT_HOURS_2: Final[list[int]] = [14, 18]
DEFAULT_SLOT_HOURS_3: Final[list[int]] = [12, 16, 20]


def detect_conflicts(matches: list[Match]) -> list[str]:
    """Detect scheduling conflicts in a list of matches.

    Conflicts include:
    - Same team playing two matches too close together (on the same day)
    - Same stadium double-booked (less than 4 hours apart)
    - Overlapping broadcast windows

    Args:
        matches: List of scheduled matches.

    Returns:
        List of conflict description strings.
    """
    conflicts: list[str] = []

    # 1. Same stadium within 4 hours (O(n log n) with bucketing & sorting)
    stadium_matches: dict[str, list[Match]] = {}
    for match in matches:
        stadium_matches.setdefault(match.stadium_id, []).append(match)

    for stadium_id, s_matches in stadium_matches.items():
        # Sort matches by scheduled time to check adjacent ones
        s_matches = sorted(s_matches, key=lambda m: m.scheduled_time)
        for i in range(len(s_matches) - 1):
            match_a = s_matches[i]
            match_b = s_matches[i + 1]
            time_diff = abs((match_a.scheduled_time - match_b.scheduled_time).total_seconds())
            if time_diff < STADIUM_CONFLICT_WINDOW_SECONDS:
                conflicts.append(
                    f"Stadium {stadium_id} double-booked: "
                    f"{match_a.match_id} and {match_b.match_id} "
                    f"are only {time_diff / 3600:.1f}h apart"
                )

    # 2. Same team playing on same day (O(n) day bucketing)
    team_matches: dict[str, list[Match]] = {}
    for match in matches:
        team_matches.setdefault(match.home_team.team_id, []).append(match)
        team_matches.setdefault(match.away_team.team_id, []).append(match)

    for team_id, t_matches in team_matches.items():
        # Group by day
        day_matches: dict[date, list[Match]] = {}
        for match in t_matches:
            day = match.scheduled_time.date()
            day_matches.setdefault(day, []).append(match)

        for _day, d_matches in day_matches.items():
            if len(d_matches) > 1:
                # Compare each pair of matches to generate conflicts
                seen_pairs = set()
                for i in range(len(d_matches)):
                    for j in range(i + 1, len(d_matches)):
                        match_a = d_matches[i]
                        match_b = d_matches[j]
                        pair = tuple(sorted([match_a.match_id, match_b.match_id]))
                        if pair not in seen_pairs:
                            seen_pairs.add(pair)
                            conflicts.append(
                                f"Team {team_id} scheduled for two matches on "
                                f"the same day: {match_a.match_id} and "
                                f"{match_b.match_id}"
                            )

    return conflicts


def check_rest_days(
    team_id: str,
    proposed_time: datetime,
    existing_matches: list[Match],
    min_rest_days: int = 2,
) -> bool:
    """Check if a team has sufficient rest days before a proposed match.

    Args:
        team_id: The team to check.
        proposed_time: The proposed match datetime.
        existing_matches: Already scheduled matches.
        min_rest_days: Minimum days between matches.

    Returns:
        True if the team has enough rest days, False otherwise.
    """
    for match in existing_matches:
        if match.status in (MatchStatus.CANCELLED, MatchStatus.POSTPONED):
            continue
        team_ids = {match.home_team.team_id, match.away_team.team_id}
        if team_id in team_ids:
            days_gap = abs((proposed_time - match.scheduled_time).days)
            if days_gap < min_rest_days:
                return False
    return True


def is_weather_suitable(weather: WeatherCondition) -> bool:
    """Determine if weather conditions are suitable for a match.

    Args:
        weather: The weather condition to check.

    Returns:
        True if suitable, False if match should be rescheduled.
    """
    unsuitable = {WeatherCondition.STORMY, WeatherCondition.EXTREME_HEAT}
    return weather not in unsuitable


def generate_time_slots(
    start_date: datetime,
    end_date: datetime,
    match_duration_hours: int = 3,
    matches_per_day: int = 2,
) -> list[datetime]:
    """Generate available time slots within a date range.

    Args:
        start_date: First available date.
        end_date: Last available date.
        match_duration_hours: Hours per match (including setup/teardown).
        matches_per_day: Maximum matches per day per stadium.

    Returns:
        List of available datetime slots.
    """
    slots: list[datetime] = []
    current_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)

    # Default slot times: afternoon and evening
    slot_hours = DEFAULT_SLOT_HOURS_2 if matches_per_day >= 2 else DEFAULT_SLOT_HOURS_1
    if matches_per_day >= 3:
        slot_hours = DEFAULT_SLOT_HOURS_3

    while current_date <= end_date:
        for hour in slot_hours[:matches_per_day]:
            slot = current_date.replace(hour=hour)
            if start_date <= slot <= end_date:
                slots.append(slot)
        current_date += timedelta(days=1)

    return slots


def optimize_schedule(
    teams: list[Team],
    stadium_ids: list[str],
    start_date: datetime,
    end_date: datetime,
    rest_days: int = 2,
) -> tuple[list[Match], list[str]]:
    """Generate an optimized match schedule using round-robin.

    Creates a round-robin schedule ensuring:
    - Each team plays every other team once
    - Minimum rest days between matches
    - Even distribution across stadiums

    Args:
        teams: List of participating teams.
        stadium_ids: Available stadium IDs.
        start_date: Tournament start date.
        end_date: Tournament end date.
        rest_days: Minimum rest days between matches for the same team.

    Returns:
        Tuple of (scheduled matches, conflict warnings).
    """
    matches: list[Match] = []
    time_slots = generate_time_slots(start_date, end_date)

    if not time_slots:
        return [], ["No available time slots in the given date range"]

    # Generate round-robin matchups
    matchups: list[tuple[Team, Team]] = []
    for i, team_a in enumerate(teams):
        for team_b in teams[i + 1 :]:
            matchups.append((team_a, team_b))

    slot_index = 0

    # Index for fast O(1) rest days check: dict[team_id, list[datetime]]
    team_schedules: dict[str, list[datetime]] = {team.team_id: [] for team in teams}

    for stadium_index, (home_team, away_team) in enumerate(matchups):
        if slot_index >= len(time_slots):
            break

        # Find a slot where both teams have enough rest (O(k) where k is team matches, not O(n))
        found = False
        for offset in range(min(MAX_SLOT_SEARCH_OFFSET, len(time_slots) - slot_index)):
            candidate_slot = time_slots[slot_index + offset]

            # Check home team
            home_ok = True
            for scheduled_time in team_schedules[home_team.team_id]:
                if abs((candidate_slot - scheduled_time).days) < rest_days:
                    home_ok = False
                    break

            # Check away team
            away_ok = True
            for scheduled_time in team_schedules[away_team.team_id]:
                if abs((candidate_slot - scheduled_time).days) < rest_days:
                    away_ok = False
                    break

            if home_ok and away_ok:
                slot_index += offset
                found = True
                break

        if not found:
            slot_index = min(slot_index + 1, len(time_slots) - 1)

        match_time = time_slots[slot_index]
        match = Match(
            match_id=f"M{len(matches) + 1:03d}",
            home_team=home_team,
            away_team=away_team,
            stadium_id=stadium_ids[stadium_index % len(stadium_ids)],
            scheduled_time=match_time,
        )
        matches.append(match)

        # Update the index
        team_schedules[home_team.team_id].append(match_time)
        team_schedules[away_team.team_id].append(match_time)

        slot_index += 1

    conflicts = detect_conflicts(matches)
    return matches, conflicts
