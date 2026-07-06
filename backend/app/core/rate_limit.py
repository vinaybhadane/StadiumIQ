"""Rate limiting configuration using slowapi.

Per-route rate limits as specified:
- POST /api/insights:         10/minute
- POST /api/matches/schedule: 20/minute
- GET  /api/crowd/surge:      30/minute
- POST /api/analytics:        15/minute
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Additional rate limits for navigation and assist
NAVIGATION_LIMIT = "60/minute"
ASSIST_LIMIT = "30/minute"
