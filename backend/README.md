# 10X Incident Intelligence — Backend

Autonomous AI incident investigation platform (hackathon).

Detects anomalies from metrics, creates incidents, investigates root cause, predicts business impact, and recommends remediation.

## Stack

- Python 3.12
- FastAPI + Uvicorn
- Pydantic
- LangGraph (optional)
- Google Gemini API via `LLMService`
- JSON mock data (no database)

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set GEMINI_API_KEY locally
```

## Run locally

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Health: `GET /health`
- Docs: `/docs`
- Report: `POST /api/v1/report`

CORS is open (`*`) so the Vite UI on `:5173` can call the API.

## Observability (Cloud Logging + Cloud Trace)

On **Cloud Run**, structured JSON logs go to **Cloud Logging** automatically (stdout).
OpenTelemetry spans export to **Cloud Trace** when `K_SERVICE` is set (`CLOUD_OBSERVABILITY_AUTO=true`).

| Env | Purpose |
|-----|---------|
| `ENABLE_CLOUD_LOGGING` | Force JSON structured logs (Cloud Logging format) |
| `ENABLE_CLOUD_TRACE` | Export OpenTelemetry spans to Cloud Trace |
| `TRACE_CONSOLE_EXPORT` | Print spans locally for debugging |
| `SERVICE_NAME` | Appears in Trace / Logging |

Instrumented spans include: HTTP requests, `orchestration.run`, Detection/Investigation agents, metrics load, Gemini/heuristic LLM calls.

**GCP Console demo:** Cloud Run → Logs (agent pipeline lines) · Cloud Trace → Trace list (waterfall after `POST /report`).

Grant the Cloud Run SA `roles/cloudtrace.agent` if traces do not appear:

```bash
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/cloudtrace.agent"
```

## Deploy to GCP from GitHub

Do **not** deploy from local disk. Push to GitHub; Cloud Build pulls the commit and deploys:

```
git push origin main → Cloud Build → Artifact Registry → Cloud Run
```

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | FastAPI container image |
| `backend/.dockerignore` | Excludes `.env` / venv from image |
| `cloudbuild.yaml` (repo root) | Build + push + Cloud Run deploy |

Full trigger setup: [docs/DEPLOY_GCP.md](../docs/DEPLOY_GCP.md)

## API

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/health` | Liveness |
| `POST` | `/api/v1/detect` | DetectionAgent |
| `POST` | `/api/v1/report` | Full orchestration report |
| `POST` | `/api/v1/investigate` | Alias for `/report` |
