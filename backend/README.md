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
