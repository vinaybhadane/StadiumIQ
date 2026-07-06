"""Tests for Pydantic validation constraints — at boundary AND beyond."""

from datetime import UTC

import pytest
from pydantic import ValidationError

from app.models.crowd import CrowdDensityReading, RiskLevel, SurgePrediction
from app.models.match import MatchStatistics, Team
from app.models.stadium import StadiumCreate, StadiumZone, ZoneType


class TestStadiumValidation:
    """Test stadium model validation boundaries."""

    def test_valid_stadium_create(self):
        s = StadiumCreate(name="Test", city="City", total_capacity=50000)
        assert s.total_capacity == 50000

    def test_empty_name_rejected(self):
        with pytest.raises(ValidationError):
            StadiumCreate(name="", city="City", total_capacity=50000)

    def test_zero_capacity_rejected(self):
        with pytest.raises(ValidationError):
            StadiumCreate(name="Test", city="City", total_capacity=0)

    def test_negative_capacity_rejected(self):
        with pytest.raises(ValidationError):
            StadiumCreate(name="Test", city="City", total_capacity=-1)

    def test_capacity_at_max_boundary(self):
        s = StadiumCreate(name="Test", city="City", total_capacity=500000)
        assert s.total_capacity == 500000

    def test_capacity_beyond_max_rejected(self):
        with pytest.raises(ValidationError):
            StadiumCreate(name="Test", city="City", total_capacity=500001)


class TestStadiumZoneValidation:
    """Test zone model validation boundaries."""

    def test_valid_zone(self):
        z = StadiumZone(zone_id="Z1", name="North", zone_type=ZoneType.GENERAL, capacity=10000)
        assert z.capacity == 10000

    def test_negative_occupancy_rejected(self):
        with pytest.raises(ValidationError):
            StadiumZone(
                zone_id="Z1",
                name="North",
                zone_type=ZoneType.GENERAL,
                capacity=10000,
                current_occupancy=-1,
            )

    def test_occupancy_percentage_calculation(self):
        z = StadiumZone(
            zone_id="Z1",
            name="North",
            zone_type=ZoneType.GENERAL,
            capacity=10000,
            current_occupancy=7500,
        )
        assert z.occupancy_percentage == 75.0


class TestTeamValidation:
    """Test team model validation."""

    def test_valid_team(self):
        t = Team(team_id="T1", name="Team A")
        assert t.ranking == 0

    def test_empty_id_rejected(self):
        with pytest.raises(ValidationError):
            Team(team_id="", name="Team A")

    def test_negative_ranking_rejected(self):
        with pytest.raises(ValidationError):
            Team(team_id="T1", name="Team A", ranking=-1)


class TestMatchStatisticsValidation:
    """Test match statistics boundaries."""

    def test_valid_stats(self):
        s = MatchStatistics(home_score=3, away_score=1)
        assert s.home_possession == 50.0

    def test_negative_score_rejected(self):
        with pytest.raises(ValidationError):
            MatchStatistics(home_score=-1)

    def test_possession_over_100_rejected(self):
        with pytest.raises(ValidationError):
            MatchStatistics(home_possession=101.0)

    def test_possession_at_boundary(self):
        s = MatchStatistics(home_possession=100.0, away_possession=0.0)
        assert s.home_possession == 100.0


class TestCrowdDensityValidation:
    """Test crowd density boundaries."""

    def test_density_at_zero(self):
        from datetime import datetime

        r = CrowdDensityReading(zone_id="Z1", timestamp=datetime.now(tz=UTC), density=0.0)
        assert r.density == 0.0

    def test_density_at_100(self):
        from datetime import datetime

        r = CrowdDensityReading(zone_id="Z1", timestamp=datetime.now(tz=UTC), density=100.0)
        assert r.density == 100.0

    def test_density_over_100_rejected(self):
        from datetime import datetime

        with pytest.raises(ValidationError):
            CrowdDensityReading(zone_id="Z1", timestamp=datetime.now(tz=UTC), density=101.0)


class TestSurgePredictionValidation:
    """Test surge prediction boundaries."""

    def test_confidence_at_boundaries(self):
        from datetime import datetime

        p = SurgePrediction(
            gate_id="G1",
            zone_id="Z1",
            predicted_peak_time=datetime.now(tz=UTC),
            risk_level=RiskLevel.GREEN,
            expected_inflow=100,
            confidence=0.0,
        )
        assert p.confidence == 0.0

        p2 = SurgePrediction(
            gate_id="G1",
            zone_id="Z1",
            predicted_peak_time=datetime.now(tz=UTC),
            risk_level=RiskLevel.GREEN,
            expected_inflow=100,
            confidence=1.0,
        )
        assert p2.confidence == 1.0

    def test_confidence_over_1_rejected(self):
        from datetime import datetime

        with pytest.raises(ValidationError):
            SurgePrediction(
                gate_id="G1",
                zone_id="Z1",
                predicted_peak_time=datetime.now(tz=UTC),
                risk_level=RiskLevel.GREEN,
                expected_inflow=100,
                confidence=1.1,
            )
