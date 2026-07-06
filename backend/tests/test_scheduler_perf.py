import time
from datetime import UTC, datetime

from app.models.match import Team
from app.stadium.scheduler import optimize_schedule


def test_scheduler_performance_large_tournament():
    """Verify that scheduling a large tournament (496 matchups) runs under 300ms."""
    # Generate 32 teams
    teams = [Team(team_id=f"T{i}", name=f"Team {i}", ranking=i % 10 + 1) for i in range(1, 33)]
    stadium_ids = [f"STD-{i:03d}" for i in range(1, 9)]  # 8 stadiums
    start_date = datetime(2026, 7, 10, 0, 0, tzinfo=UTC)
    end_date = datetime(2026, 8, 30, 0, 0, tzinfo=UTC)

    # Time the execution of optimize_schedule
    start_time = time.perf_counter()
    matches, conflicts = optimize_schedule(
        teams=teams,
        stadium_ids=stadium_ids,
        start_date=start_date,
        end_date=end_date,
        rest_days=2,
    )
    end_time = time.perf_counter()
    duration = end_time - start_time

    # Verification
    # 32 teams round-robin = (32 * 31) / 2 = 496 matches
    assert len(matches) > 0
    # Optimize_schedule runtime must be very fast.
    # Asserting < 300ms to be extremely safe in slower virtualization environments/CI
    assert duration < 0.3, f"Scheduler took too long: {duration:.3f} seconds"
