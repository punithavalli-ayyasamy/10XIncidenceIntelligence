# Deploy backend to Cloud Run from GitHub (not from local disk)

Cloud Build watches the GitHub repo. On push to `main`, it builds `backend/Dockerfile`,
pushes the image to Artifact Registry, and deploys a new Cloud Run revision.

```
git push origin main
    → Cloud Build trigger
    → docker build ./backend
    → Artifact Registry
    → gcloud run deploy
```

## One-time GCP setup

### 1. Project + APIs

```bash
export PROJECT_ID=YOUR_GCP_PROJECT_ID
export REGION=us-central1

gcloud config set project "$PROJECT_ID"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com
```

### 2. Gemini secret (optional but recommended)

```bash
# Create once (paste key when prompted, or use --data-file)
printf '%s' 'YOUR_GEMINI_API_KEY' | gcloud secrets create gemini-api-key --data-file=-

# Cloud Run default compute SA needs accessor
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Cloud Build permissions

Cloud Build’s service account must deploy Cloud Run and push images:

```bash
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/artifactregistry.admin"
```

### 4. Connect GitHub → Cloud Build

1. Open [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. **Connect repository** → **GitHub (Cloud Build GitHub App)**
3. Authorize the org/repo (complete SAML SSO if the org requires it)
4. Select this repository

### 5. Create the trigger

| Field | Value |
|--------|--------|
| Name | `deploy-tenx-incident-api` |
| Event | Push to a branch |
| Branch | `^main$` |
| Configuration | Cloud Build configuration file |
| Location | `cloudbuild.yaml` (repo root) |
| Substitution `_REGION` | `us-central1` |
| Substitution `_SERVICE_NAME` | `tenx-incident-api` |
| Substitution `_AR_REPO` | `tenx-incident` |
| Substitution `_ALLOW_UNAUTH` | `true` (hackathon public API) |

Save the trigger.

## Everyday deploy flow

```bash
git add .
git commit -m "your change"
git push origin main
```

Then check:

- Cloud Build history: build should turn green
- Cloud Run → `tenx-incident-api` → latest revision
- Health: `https://tenx-incident-api-XXXX.a.run.app/health`
- Docs: `https://tenx-incident-api-XXXX.a.run.app/docs`

## Manual trigger (still from GitHub commit, not laptop upload)

```bash
gcloud builds submit --config=cloudbuild.yaml .
```

Prefer the GitHub trigger so deploys always come from a pushed commit.

## Frontend (Mission Control UI)

SPA is served by nginx on Cloud Run (`tenx-incident-ui`). Uses mock data unless you bake in an API URL.

### Deploy from Cloud Shell (after push)

```bash
gcloud builds submit --config=cloudbuild.frontend.yaml .

# Optional: point UI at the API at build time
gcloud builds submit --config=cloudbuild.frontend.yaml . \
  --substitutions=_VITE_API_BASE_URL=https://tenx-incident-api-XXXX.a.run.app
```

Or source deploy from the `frontend/` folder:

```bash
cd frontend
gcloud run deploy tenx-incident-ui \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

## Files involved

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | Container image for FastAPI / Uvicorn |
| `backend/.dockerignore` | Keep image small / exclude `.env` |
| `cloudbuild.yaml` | Backend: build → push → Cloud Run |
| `frontend/Dockerfile` | Multi-stage Vite build + nginx |
| `frontend/nginx.conf` | Listen on 8080, SPA fallback |
| `frontend/.dockerignore` | Exclude `node_modules` / `dist` |
| `cloudbuild.frontend.yaml` | Frontend: build → push → Cloud Run |

## Notes

- `.env` is **not** copied into the image (gitignored + dockerignored). Use Secret Manager.
- If `gemini-api-key` is missing, the service still deploys with `ALLOW_HEURISTIC_LLM_FALLBACK=true`.
- For a private API, set trigger substitution `_ALLOW_UNAUTH=false`.
- Frontend listens on **8080** (Cloud Run). UI works offline with mock data until `VITE_API_BASE_URL` is set.
