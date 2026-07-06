# ============================================================
# StadiumIQ — Multi-stage Dockerfile
# Stage 1: Build frontend with Node 20
# Stage 2: Run backend with Python 3.11 (slim)
# Final image target: < 200MB
# ============================================================

# --- Stage 1: Frontend Build ---
FROM node:20-alpine AS frontend-build

WORKDIR /build/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY frontend/ ./
RUN npm run build

# --- Stage 2: Backend Runtime ---
FROM python:3.11-slim AS runtime

# Security: non-root user
RUN groupadd --gid 1001 appuser \
    && useradd --uid 1001 --gid 1001 --create-home appuser

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/app/ ./app/

# Copy built frontend assets
COPY --from=frontend-build /build/frontend/dist ./static/

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Environment defaults (all Google services disabled for local dev)
ENV USE_GEMINI=false \
    USE_FIRESTORE=false \
    USE_BIGQUERY=false \
    USE_PUBSUB=false \
    PORT=8080

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/api/health')" || exit 1

CMD ["uvicorn", "app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8080"]
