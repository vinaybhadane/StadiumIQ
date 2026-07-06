# StadiumIQ — Smart Stadium & Tournament Intelligence Platform

[![CI — StadiumIQ](https://github.com/vinaybhadane/StadiumIQ/actions/workflows/ci.yml/badge.svg)](https://github.com/vinaybhadane/StadiumIQ/actions/workflows/ci.yml)
[![Python 3.11 | 3.12](https://img.shields.io/badge/Python-3.11%20%7C%203.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blueviolet.svg)](https://tailwindcss.com/)
[![Accessibility WCAG 2.2](https://img.shields.io/badge/WCAG-2.2%20AA-orange.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)

AI-powered venue intelligence for fans, organizers, volunteers, and on-ground staff — from smart indoor navigation to real-time multilingual decision support.

## Live Demo
🔗 https://stadium-iq-run-url-placeholder.a.run.app (Placeholder after deployment)

---

## Who It Serves

| Persona | How StadiumIQ Helps |
|---------|-------------------|
| **🏟️ Fans** | Smart wayfinding to seats/concessions/exits, multilingual assistance, crowd-aware gate recommendations, real-time match updates |
| **📋 Organizers** | AI decision support for scheduling, resource allocation, conflict detection, multilingual public announcements |
| **🙋 Volunteers** | AI-optimized task assignments, real-time duty updates in preferred language, crowd-aware zone assignments |
| **👷 On-Ground Staff** | Live incident prioritization, AI-generated response scripts, multilingual communication tools, emergency coordination |

---

## 🌟 Feature Set

1. **Real-Time Crowd Intelligence Dashboard**: Crowd heatmap and gate utilization trackers updated dynamically.
2. **Digital Stadium Twin Concept**: Live circular SVGs simulating stand capacities and entry velocities.
3. **AI Match Scheduling Optimizer**: Generates round-robin bracket matches conforming to safety resting days.
4. **Real-Time Decision Support Hub**: Real-time operational alerts, AI duty scheduling, and response scripts for all 4 personas.
5. **Player & Team Performance Tracker**: Logs stand statistics, stands standings, and tactical pre-match AI summaries.
6. **Emergency Response Coordinator**: Identifies egress routes and alerts based on exit throughput speeds.
7. **Tournament Analytics Hub**: Graphing match attendance metrics over time.
8. **Smart Indoor Navigation System**: Wheelchair-accessible routing inside stands and concessions.
9. **Multi-Language Assistance Module**: Gemini queries auto-detect Hindi, Spanish, French, and Arabic query strings.

---

## 🏗️ Architecture

```
                                +-------------------+
                                |   React Frontend  |
                                +---------+---------+
                                          | REST
                                          v
                                +---------+---------+
                                |  FastAPI Backend  |
                                +----+----+----+----+
                                     |    |    |
            +------------------------+    |    +-----------------------+
            |                             |                            |
            v                             v                            v
  +---------+---------+         +---------+---------+        +---------+---------+
  |  Vertex AI Gemini |         |  Firestore Db     |        |  BigQuery Logs    |
  |  (1.5 Flash Model)|         |  (Realtime Sync)  |        |  (Async Tasks)    |
  +-------------------+         +-------------------+        +-------------------+
```

---

## Evaluation Rubric Mapping

| Criterion | What We Did | Where to Look |
|-----------|-------------|---------------|
| Code Quality | TypeScript strict (0 any), mypy --strict, ruff clean, no imports inside functions, create_app() factory, App.tsx ≤ 200 lines | `backend/pyproject.toml`, `frontend/tsconfig.json`, `CODE_QUALITY_STANDARDS.md` |
| Security | 8 security headers, ADC (zero API keys), bandit + pip-audit in CI, PII redaction code (safety.py), Firestore rules deny update/delete | `SECURITY_ARCHITECTURE.md`, `backend/app/core/security.py`, `backend/app/core/safety.py`, `firestore.rules` |
| Efficiency | Multi-stage Docker, lazy client init, asyncio fire-and-forget, React.lazy, useMemo/useCallback, App boots with USE_*=false | `PERFORMANCE_REPORT.md`, `Dockerfile`, `backend/app/services/` |
| Testing | pytest 90%+ coverage, vitest 85%+, 3 Gemini failure modes, BigQuery/PubSub never-raise, PII redaction tested, Python 3.11+3.12 matrix, offline mocking | `TESTING_STRATEGY.md`, `backend/tests/`, `frontend/tests/`, `.github/workflows/ci.yml` |
| Accessibility | WCAG 2.2 AA, prefers-reduced-motion/contrast/forced-colors CSS, skip link, aria-live on ALL dynamic content, jest-axe zero violations on all 9 components | `ACCESSIBILITY_COMPLIANCE_REPORT.md`, `frontend/src/styles/accessibility.css`, `frontend/tests/accessibility.test.tsx` |
| Google Services | Cloud Run + Vertex AI (6 use cases: crowd prediction, scheduling, wayfinding, multilingual assist, decision support, tournament summaries) + Firestore + BigQuery + Pub/Sub + Secret Manager + Cloud Build = 7 services | `docs/ARCHITECTURE.md`, `backend/app/services/`, `docs/JUDGE_EVIDENCE.md` |
| Problem Alignment | All 4 PS tracks: crowd management ✅, indoor navigation ✅, decision support ✅, multilingual ✅. All 4 personas: fans ✅, organizers ✅, volunteers ✅, staff ✅ | `docs/JUDGE_EVIDENCE.md`, `docs/PRD.md`, Live Demo |

---

## 🚀 Quick Start (Offline Mode)

By default, all Google Cloud Services are disabled to allow fully offline development.

1. Clone the project and configure environments:
   ```bash
   cp .env.example .env
   ```
2. Build and launch application using Docker:
   ```bash
   docker build -t stadium-iq .
   docker run -p 8080:8080 --env-file .env stadium-iq
   ```
3. Open http://localhost:8080 in your browser.
