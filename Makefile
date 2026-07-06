.PHONY: help install install-dev test lint format clean docker-build docker-run

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# --- Backend ---
install: ## Install backend production dependencies
	cd backend && pip install -r requirements.txt

install-dev: ## Install all dependencies (backend + frontend)
	cd backend && pip install -r requirements.txt && pip install -r requirements-dev.txt
	cd frontend && npm ci

test-backend: ## Run backend tests with coverage
	cd backend && pytest --cov=app --cov-report=term-missing --cov-fail-under=90

test-frontend: ## Run frontend tests with coverage
	cd frontend && npm run test -- --coverage

test: test-backend test-frontend ## Run all tests

lint-backend: ## Run backend linters
	cd backend && ruff check app/ && mypy app/ --strict

lint-frontend: ## Run frontend linters
	cd frontend && npx eslint src/ && npx tsc --noEmit

lint: lint-backend lint-frontend ## Run all linters

format: ## Format backend code
	cd backend && ruff format app/ tests/

clean: ## Clean build artifacts
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .mypy_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf frontend/dist frontend/coverage backend/htmlcov

# --- Security ---
security: ## Run security scans
	cd backend && bandit -r app/ -ll && pip-audit -r requirements.txt

# --- Docker ---
docker-build: ## Build Docker image
	docker build -t stadium-iq:latest .

docker-run: ## Run Docker container
	docker run -p 8080:8080 --env-file .env stadium-iq:latest

# --- Dev ---
dev-backend: ## Run backend dev server
	cd backend && uvicorn app.main:create_app --factory --reload --port 8080

dev-frontend: ## Run frontend dev server
	cd frontend && npm run dev
