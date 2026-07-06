"""Tests for capacity.py pure functions — zero mocking required."""

import pytest

from app.models.crowd import RiskLevel
from app.stadium.capacity import (
    calculate_evacuation_time,
    calculate_gate_distribution,
    calculate_overall_capacity_score,
    calculate_surge_risk,
    calculate_zone_density,
)


class TestCalculateZoneDensity:
    """Tests for zone density calculation."""

    def test_full_capacity(self):
        assert calculate_zone_density(10000, 10000) == 100.0

    def test_empty(self):
        assert calculate_zone_density(0, 10000) == 0.0

    def test_half_capacity(self):
        assert calculate_zone_density(5000, 10000) == 50.0

    def test_precise_rounding(self):
        assert calculate_zone_density(3333, 10000) == 33.33

    def test_negative_capacity_raises(self):
        with pytest.raises(ValueError, match="Capacity must be positive"):
            calculate_zone_density(100, -1)

    def test_zero_capacity_raises(self):
        with pytest.raises(ValueError, match="Capacity must be positive"):
            calculate_zone_density(100, 0)

    def test_negative_occupancy_raises(self):
        with pytest.raises(ValueError, match="Occupancy cannot be negative"):
            calculate_zone_density(-1, 10000)


class TestCalculateGateDistribution:
    """Tests for gate crowd distribution."""

    def test_even_distribution(self):
        result = calculate_gate_distribution(10000, {"G1": 500, "G2": 500})
        assert result["G1"] + result["G2"] == 10000

    def test_proportional_distribution(self):
        result = calculate_gate_distribution(10000, {"G1": 1000, "G2": 3000})
        assert result["G1"] < result["G2"]

    def test_single_gate(self):
        result = calculate_gate_distribution(5000, {"G1": 1000})
        assert result["G1"] == 5000

    def test_zero_expected(self):
        result = calculate_gate_distribution(0, {"G1": 500, "G2": 500})
        assert all(v == 0 for v in result.values())

    def test_negative_expected_raises(self):
        with pytest.raises(ValueError, match="cannot be negative"):
            calculate_gate_distribution(-1, {"G1": 500})

    def test_empty_gates_raises(self):
        with pytest.raises(ValueError, match="At least one gate"):
            calculate_gate_distribution(1000, {})

    def test_sum_matches_total(self):
        result = calculate_gate_distribution(9999, {"G1": 300, "G2": 500, "G3": 200})
        assert sum(result.values()) == 9999


class TestCalculateSurgeRisk:
    """Tests for surge risk level calculation."""

    def test_green_low_occupancy_low_flow(self):
        assert calculate_surge_risk(100, 100, 10000, 5000) == RiskLevel.GREEN

    def test_yellow_high_occupancy(self):
        assert calculate_surge_risk(100, 100, 10000, 7500) == RiskLevel.YELLOW

    def test_yellow_elevated_flow(self):
        assert calculate_surge_risk(140, 100, 10000, 5000) == RiskLevel.YELLOW

    def test_red_high_both(self):
        assert calculate_surge_risk(200, 100, 10000, 9000) == RiskLevel.RED

    def test_red_zero_capacity(self):
        assert calculate_surge_risk(100, 100, 0, 0) == RiskLevel.RED

    def test_green_zero_flow(self):
        assert calculate_surge_risk(0, 0, 10000, 5000) == RiskLevel.GREEN


class TestCalculateEvacuationTime:
    """Tests for evacuation time calculation."""

    def test_basic_calculation(self):
        result = calculate_evacuation_time(10000, {"E1": 500, "E2": 500}, safety_factor=1.0)
        assert result["E1"] == 10.0
        assert result["E2"] == 10.0

    def test_safety_factor_increases_time(self):
        result_safe = calculate_evacuation_time(10000, {"E1": 1000}, safety_factor=2.0)
        result_normal = calculate_evacuation_time(10000, {"E1": 1000}, safety_factor=1.0)
        assert result_safe["E1"] > result_normal["E1"]

    def test_zero_occupancy(self):
        result = calculate_evacuation_time(0, {"E1": 500})
        assert result["E1"] == 0.0

    def test_negative_occupancy_raises(self):
        with pytest.raises(ValueError, match="cannot be negative"):
            calculate_evacuation_time(-1, {"E1": 500})

    def test_zero_safety_factor_raises(self):
        with pytest.raises(ValueError, match="Safety factor must be positive"):
            calculate_evacuation_time(1000, {"E1": 500}, safety_factor=0)

    def test_empty_exits(self):
        result = calculate_evacuation_time(1000, {})
        assert result == {}


class TestCalculateOverallCapacityScore:
    """Tests for overall capacity score."""

    def test_full_capacity(self):
        assert calculate_overall_capacity_score([(100, 100)]) == 100.0

    def test_empty(self):
        assert calculate_overall_capacity_score([(0, 100)]) == 0.0

    def test_no_zones(self):
        assert calculate_overall_capacity_score([]) == 0.0

    def test_multiple_zones(self):
        result = calculate_overall_capacity_score([(5000, 10000), (3000, 10000)])
        assert result == 40.0


class TestRulesEngine:
    """Tests for stadium/rules.py fallback rule calculations."""

    def test_generate_crowd_insights(self):
        from app.stadium.rules import generate_crowd_insights

        res = generate_crowd_insights(90.0, {"G1": 95.0})
        assert len(res) == 2
        assert "High Stadium Occupancy" in res[0].title
        assert "Gate G1 Near Capacity" in res[1].title

    def test_generate_resource_recommendations(self):
        from app.stadium.rules import generate_resource_recommendations

        res = generate_resource_recommendations(10000, 20000, 1, 10)
        assert len(res) == 2
        # staff: 1 per 250 -> 40 staff needed, we have 10
        # medical: 1 per 5000 -> 2 needed, we have 1

    def test_generate_match_briefing(self):
        from app.stadium.rules import generate_match_briefing

        res = generate_match_briefing("Team A", "Team B", ["W", "W"], ["L"])
        assert "Pre-Match Briefing" in res

    def test_generate_persona_decision_support(self):
        from app.stadium.rules import generate_persona_decision_support

        for persona in ["organizer", "volunteer", "staff", "fan"]:
            res = generate_persona_decision_support(persona)
            assert len(res) == 1
            assert persona.upper()[:2] in res[0].insight_id
