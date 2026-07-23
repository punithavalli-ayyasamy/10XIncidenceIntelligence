# 10X Incident Intelligence — Backend

Autonomous AI incident investigation platform (hackathon scaffold).

Detects anomalies from metrics, creates incidents, investigates root cause, predicts business impact, and recommends remediation.

## Status

**Scaffold only** — folders, placeholder classes, interfaces, TODO comments, and API skeletons. Business logic is not implemented yet.

## Stack

- Python 3.12
- FastAPI + Uvicorn
- Pydantic
- LangGraph (optional placeholder)
- Google Gemini API (abstract `LLMClient` / `GeminiLLMClient`)
- JSON mock data (no database)

## Project layout

```
backend/
├── app/
│   ├── agents/          # Detection, investigation, dependency, impact, prediction, recommendation
│   ├── tools/           # Metrics, logs, topology, deployment, traffic
│   ├── services/        # IncidentOrchestrator (+ future LangGraph wiring)
│   ├── api/             # /api/v1/investigate routes
│   ├── models/          # Incident + metric Pydantic models
│   ├── prompts/         # Agent prompt stubs
│   ├── mock_data/       # JSON fixtures
│   └── main.py          # FastAPI entrypoint
├── requirements.txt
└── README.md
```

## Setup

```bash
cd backend
python3 -m venv .venv   # or: brew install python@3.12 && python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Optional: set `GEMINI_API_KEY` when implementing the Gemini client.

## Run

From the `backend/` directory (so `app` is importable):

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Health: `GET http://localhost:8000/health`
- OpenAPI: `http://localhost:8000/docs`

## API skeletons

| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/api/v1/investigate` | Kicks orchestrator (returns 202 stub) |
| `GET`  | `/api/v1/incidents` | List incidents (empty) |
| `GET`  | `/api/v1/incidents/{id}` | Fetch incident (501 until implemented) |

## Next steps (TODO)

1. Populate `mock_data/` with a realistic payments incident scenario.
2. Implement tool JSON loaders.
3. Implement agent `run()` methods + prompts.
4. Wire `IncidentOrchestrator` (sequential first; LangGraph optional).
5. Implement `GeminiLLMClient` against the Google Gemini API.
