# 10X Incident Intelligence — Mission Control

AI Mission Control UI for the **10th Anniversary Hackathon**.

## Run

```bash
# Terminal 1 — backend
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend (proxies /api → :8000)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — UI calls `POST /api/v1/report` on load (status bar + **Run report**).

Optional `frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost:8000
```
(Leave empty to use the Vite proxy.)

## Tabs

1. **Dashboard** — 30-second incident brief  
2. **Investigation** — SRE RCA workspace  
3. **Service Graph** — React Flow + service side panel  
4. **AI Agents** — Detection · Detective · Impact · Prediction · Healing  
5. **Self-Healing** — executable remediations with rollback  
6. **Executive Report** — CTO brief  

Viewport-locked layout (`overflow: hidden`) with glassmorphism Mission Control styling. Mock story data in `src/data/mockReport.ts`.
