# Story 1.1: Initialize Monorepo with Frontend and Backend Scaffolding

Status: done

## Story

As a **developer**,
I want a fully initialized monorepo with Vite+React+TypeScript frontend and FastAPI backend,
so that the team can start building features immediately.

## Acceptance Criteria

1. **Given** a fresh clone of the repository
   **When** I run `cd frontend && npm install && npm run dev`
   **Then** the frontend starts on port 5173 and displays a blank dark page

2. **Given** the frontend is initialized
   **When** I inspect the configuration
   **Then** Tailwind v4 is configured via `@tailwindcss/vite` plugin
   **And** Vite proxy forwards `/api` and `/media` to `localhost:8000`

3. **Given** the backend folder is set up
   **When** I run `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
   **Then** the backend starts on port 8000
   **And** FastAPI has CORS middleware allowing `localhost:5173`

4. **Given** both servers are running
   **When** I access `http://localhost:5173/api/health`
   **Then** I receive `{ "status": "success", "data": { "service": "synthetica" } }` proxied from the backend

5. **Given** the project is initialized
   **When** I check configuration files
   **Then** `.env.example` files exist in both `frontend/` and `backend/` with placeholder variables
   **And** `.gitignore` exists at project root covering `node_modules`, `__pycache__`, `.env`, `media/`, `dist/`

## Tasks / Subtasks

- [x] Task 1: Initialize frontend with Vite (AC: #1, #2)
  - [x] 1.1: Run `npm create vite@latest frontend -- --template react-ts` from project root
  - [x] 1.2: `cd frontend && npm install tailwindcss @tailwindcss/vite`
  - [x] 1.3: Update `vite.config.ts`: add `tailwindcss()` plugin and proxy config for `/api` and `/media` to `http://localhost:8000`
  - [x] 1.4: Replace `src/index.css` content with `@import "tailwindcss";`
  - [x] 1.5: Clean out default Vite boilerplate (App.tsx placeholder, remove counter, remove vite.svg)
  - [x] 1.6: Create `frontend/.env.example` with `VITE_API_URL=http://localhost:8000`
- [x] Task 2: Initialize backend with FastAPI (AC: #3, #4)
  - [x] 2.1: Create directory structure: `backend/app/{routers,services,models}/` with `__init__.py` files
  - [x] 2.2: Create `backend/requirements.txt` with: `fastapi`, `uvicorn[standard]`, `httpx`, `python-multipart`, `pydantic-settings`, `python-dotenv`
  - [x] 2.3: Create `backend/app/config.py` with `Settings(BaseSettings)` class loading from `.env`
  - [x] 2.4: Create `backend/app/main.py` with FastAPI app, CORS middleware (allow origin `http://localhost:5173`), health check endpoint `GET /api/health`
  - [x] 2.5: Create empty router files: `artist.py`, `audio.py`, `video.py`, `feed.py` in `routers/`
  - [x] 2.6: Create empty service files: `gemini.py`, `nano_banana.py`, `lyria.py`, `veo.py` in `services/`
  - [x] 2.7: Create `backend/app/storage.py` with in-memory dicts: `artists = {}`, `clips = []`, `influences = []`
  - [x] 2.8: Create `backend/media/{avatars,audio,clips}/` directories and mount `/media` as StaticFiles
  - [x] 2.9: Create `backend/.env.example` with: `GOOGLE_AI_API_KEY=`, `GEMINI_MODEL=gemini-2.0-flash`, `NANO_BANANA_MODEL=gemini-3.1-flash-image-preview`
- [x] Task 3: Project root configuration (AC: #5)
  - [x] 3.1: Create root `.gitignore` covering: `node_modules/`, `dist/`, `__pycache__/`, `.env`, `*.pyc`, `backend/media/avatars/*`, `backend/media/audio/*`, `backend/media/clips/*`, `.venv/`
  - [x] 3.2: Move existing `public/` content (Stitch templates + logo) into `frontend/public/` so it's served by Vite
  - [x] 3.3: Create root `.env.example` referencing both frontend and backend env files

## Dev Notes

### Architecture Compliance

- **Monorepo structure:** `frontend/` (Vite+React+TS) and `backend/` (Python FastAPI) at project root
- **No build tooling beyond Vite** — no Turborepo, no Lerna, keep it simple for hackathon
- **FastAPI app prefix:** All API routes under `/api/` prefix
- **StaticFiles mount:** `app.mount("/media", StaticFiles(directory="media"), name="media")`

### Technical Requirements

- **Vite 8** with `react-ts` template
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin — NO `tailwind.config.js`, NO PostCSS config needed
- **FastAPI** with `uvicorn[standard]` for WebSocket support later
- **Pydantic Settings** for env var loading: `from pydantic_settings import BaseSettings`
- **CORS:** `CORSMiddleware` with `allow_origins=["http://localhost:5173"]`, `allow_methods=["*"]`, `allow_headers=["*"]`

### Vite Proxy Config Pattern

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/media': 'http://localhost:8000',
    }
  }
})
```

### FastAPI Main Pattern

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Synthetica API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media", StaticFiles(directory="media"), name="media")

@app.get("/api/health")
async def health():
    return {"status": "success", "data": {"service": "synthetica"}}
```

### Existing Assets

- `public/templates/` — 5 Stitch mockup PNGs (dashboard, profile, camera, session, home screens)
- `public/images/logo.png` — Synthetica logo (purple/cyan gradient waveform "W")
- These must be moved to `frontend/public/` during init so Vite serves them

### File Structure (Final State)

```
vibemusic/
├── .gitignore
├── .env.example
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── .env.example
│   ├── public/
│   │   ├── images/logo.png
│   │   └── templates/*.png
│   └── src/
│       ├── main.tsx
│       ├── App.tsx          # Minimal placeholder
│       └── index.css        # @import "tailwindcss";
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── storage.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── artist.py    (empty)
│   │   │   ├── audio.py     (empty)
│   │   │   ├── video.py     (empty)
│   │   │   └── feed.py      (empty)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── gemini.py    (empty)
│   │   │   ├── nano_banana.py (empty)
│   │   │   ├── lyria.py     (empty)
│   │   │   └── veo.py       (empty)
│   │   └── models/
│   │       └── __init__.py
│   └── media/
│       ├── avatars/
│       ├── audio/
│       └── clips/
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Tailwind @tailwindcss/vite v4.2.1 has peer dep conflict with Vite 8.0.0 — resolved with --legacy-peer-deps (Vite 8 support merged but not released yet)

### Completion Notes List

- Frontend: Vite 8 + React 19 + TypeScript scaffolded, Tailwind v4 configured, proxy set up
- Backend: FastAPI with CORS, health endpoint, 4 routers, 4 services, storage module, media dirs
- Stitch assets (5 templates + logo) copied to frontend/public/
- .gitignore created at root with comprehensive rules
- All acceptance criteria verified: frontend builds, backend starts, health endpoint returns correct response

### File List

- frontend/vite.config.ts (modified)
- frontend/src/index.css (modified)
- frontend/src/App.tsx (modified)
- frontend/.env.example (new)
- frontend/public/images/logo.png (copied)
- frontend/public/templates/*.png (copied)
- backend/requirements.txt (new)
- backend/.env.example (new)
- backend/app/__init__.py (new)
- backend/app/main.py (new)
- backend/app/config.py (new)
- backend/app/storage.py (new)
- backend/app/routers/__init__.py (new)
- backend/app/routers/artist.py (new)
- backend/app/routers/audio.py (new)
- backend/app/routers/video.py (new)
- backend/app/routers/feed.py (new)
- backend/app/services/__init__.py (new)
- backend/app/services/gemini.py (new)
- backend/app/services/nano_banana.py (new)
- backend/app/services/lyria.py (new)
- backend/app/services/veo.py (new)
- backend/app/models/__init__.py (new)
- backend/media/avatars/.gitkeep (new)
- backend/media/audio/.gitkeep (new)
- backend/media/clips/.gitkeep (new)
- .gitignore (new)
- .env.example (new — root, referencing frontend and backend env files)
