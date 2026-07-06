# Platform Architecture Document

## 1. Technical Stack Selection
- **FastAPI (Python 3.11/3.12)**: Asynchronous, fast performance, Pydantic v2 schemas at boundaries.
- **React + Tailwind (Vite)**: Optimized static builds with chunk splitting for Recharts.
- **Zustand**: Decoupled store holding interface status variables cleanly.

## 2. Google Cloud Integration Details
- **Vertex AI (Gemini 1.5 Flash)**: Prompts sanitized through regex filters to remove phone/email patterns.
- **Firestore & BigQuery**: Lazy connection handlers with async logging prevent database delays.
