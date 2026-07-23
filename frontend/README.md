# 10X Incident Intelligence — Mission Control

AI Mission Control UI for the **10th Anniversary Hackathon**.

## Run

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Tabs

1. **Dashboard** — 30-second incident brief  
2. **Investigation** — SRE RCA workspace  
3. **Service Graph** — React Flow + service side panel  
4. **AI Agents** — Sentinel · Investigator · Navigator · Oracle · Healer  
5. **Self-Healing** — executable remediations with rollback  
6. **Executive Report** — CTO brief  

Viewport-locked layout (`overflow: hidden`) with glassmorphism Mission Control styling. Mock story data in `src/data/mockReport.ts`.
