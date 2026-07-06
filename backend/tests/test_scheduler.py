"""Tests for scheduler.py pure functions — zero mocking required."""

from datetime import UTC, datetime

from app.models.match import Match, MatchStatus, Team, WeatherCondition
from app.stadium.scheduler import (
    check_rest_days,
    detect_conflicts,
    generate_time_slots,
    is_weather_suitable,
    optimize_schedule,
)


def _make_team(team_id: str, name: str = "Team") -> Team:
    return Team(team_id=team_id, name=name)


def _make_match(
    match_id: str,
    home_id: str,
    away_id: str,
    stadium_id: str,
    time: datetime,
    status: MatchStatus = MatchStatus.SCHEDULED,
) -> Match:
    return Match(
        match_id=match_id,
        home_team=_make_team(home_id, f"Team {home_id}"),
        away_team=_make_team(away_id, f"Team {away_id}"),
        stadium_id=stadium_id,
        scheduled_time=time,
        status=status,
    )


class TestDetectConflicts:
    """Tests for scheduling conflict detection."""

    def test_no_conflicts(self):
        matches = [
            _make_match("M1", "T1", "T2", "S1", datetime(2026, 7, 10, 16, 0, tzinfo=UTC)),
            _make_match("M2", "T3", "T4", "S2", datetime(2026, 7, 10, 16, 0, tzinfo=UTC)),
        ]
        assert detect_conflicts(matches) == []

    def test_stadium_double_booking(self):
        matches = [
            _make_match("M1", "T1", "T2", "S1", datetime(2026, 7, 10, 16, 0, tzinfo=UTC)),
            _make_match("M2", "T3", "T4", "S1", datetime(2026, 7, 10, 18, 0, tzinfo=UTC)),
        ]
        conflicts = detect_conflicts(matches)
        assert len(conflicts) >= 1
        assert "double-booked" in conflicts[0]

    def test_team_same_day(self):
        matches = [
            _make_match("M1", "T1", "T2", "S1", datetime(2026, 7, 10, 14, 0, tzinfo=UTC)),
            _make_match("M2", "T1", "T3", "S2", datetime(2026, 7, 10, 20, 0, tzinfo=UTC)),
        ]
        conflicts = detect_conflicts(matches)
        assert any("T1" in c for c in conflicts)

    def test_empty_list(self):
        assert detect_conflicts([]) == []


class TestCheckRestDays:
    """Tests for team rest day validation."""

    def test_sufficient_rest(self):
        existing = [
            _make_match("M1", "T1", "T2", "S1", datetime(2026, 7, 10, 16, 0, tzinfo=UTC)),
        ]
        proposed = datetime(2026, 7, 15, 16, 0, tzinfo=UTC)
        assert check_rest_days("T1", proposed, existing, min_rest_days=2) is True

    def test_insufficient_rest(self):
        existing = [
            _make_match("M1", "T1", "T2", "S1", datetime(2026, 7, 10, 16, 0, tzinfo=UTC)),
        ]
        proposed = datetime(2026, 7, 11, 16, 0, tzinfo=UTC)
        assert check_rest_days("T1", proposed, existing, min_rest_days=2) is False

    def test_cancelled_matches_ignored(self):
        existing = [
            _make_match(
                "M1",
                "T1",
                "T2",
                "S1",
                datetime(2026, 7, 10, 16, 0, tzinfo=UTC),
                status=MatchStatus.CANCELLED,
            ),
        ]
        proposed = datetime(2026, 7, 11, 16, 0, tzinfo=UTC)
        assert check_rest_days("T1", proposed, existing, min_rest_days=2) is True

    def test_no_existing_matches(self):
        assert check_rest_days("T1", datetime(2026, 7, 10, tzinfo=UTC), []) is True


class TestIsWeatherSuitable:
    """Tests for weather suitability."""

    def test_clear_is_suitable(self):
        assert is_weather_suitable(WeatherCondition.CLEAR) is True

    def test_cloudy_is_suitable(self):
        assert is_weather_suitable(WeatherCondition.CLOUDY) is True

    def test_rainy_is_suitable(self):
        assert is_weather_suitable(WeatherCondition.RAINY) is True

    def test_stormy_is_not_suitable(self):
        assert is_weather_suitable(WeatherCondition.STORMY) is False

    def test_extreme_heat_is_not_suitable(self):
        assert is_weather_suitable(WeatherCondition.EXTREME_HEAT) is False


class TestGenerateTimeSlots:
    """Tests for time slot generation."""

    def test_generates_slots(self):
        slots = generate_time_slots(
            datetime(2026, 7, 10, tzinfo=UTC),
            datetime(2026, 7, 12, tzinfo=UTC),
        )
        assert len(slots) > 0

    def test_slots_within_range(self):
        start = datetime(2026, 7, 10, tzinfo=UTC)
        end = datetime(2026, 7, 12, tzinfo=UTC)
        slots = generate_time_slots(start, end)
        for slot in slots:
            assert start <= slot <= end

    def test_empty_range(self):
        slots = generate_time_slots(
            datetime(2026, 7, 12, tzinfo=UTC),
            datetime(2026, 7, 10, tzinfo=UTC),
        )
        assert slots == []


class TestOptimizeSchedule:
    """Tests for the round-robin schedule optimizer."""

    def test_generates_matches(self):
        teams = [_make_team(f"T{i}", f"Team {i}") for i in range(4)]
        matches, conflicts = optimize_schedule(
            teams=teams,
            stadium_ids=["S1", "S2"],
            start_date=datetime(2026, 7, 1, tzinfo=UTC),
            end_date=datetime(2026, 7, 30, tzinfo=UTC),
        )
        assert len(matches) > 0

    def test_round_robin_match_count(self):
        teams = [_make_team(f"T{i}", f"Team {i}") for i in range(4)]
        matches, _ = optimize_schedule(
            teams=teams,
            stadium_ids=["S1"],
            start_date=datetime(2026, 7, 1, tzinfo=UTC),
            end_date=datetime(2026, 8, 30, tzinfo=UTC),
        )
        # 4 teams = 6 matches in round-robin
        assert len(matches) == 6

    def test_two_teams(self):
        teams = [_make_team("T1", "Team A"), _make_team("T2", "Team B")]
        matches, _ = optimize_schedule(
            teams=teams,
            stadium_ids=["S1"],
            start_date=datetime(2026, 7, 1, tzinfo=UTC),
            end_date=datetime(2026, 7, 30, tzinfo=UTC),
        )
        assert len(matches) == 1
