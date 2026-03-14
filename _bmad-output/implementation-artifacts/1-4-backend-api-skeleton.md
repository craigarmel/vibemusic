# Story 1.4: Backend API Skeleton with Health Check

Status: done

## Story

As a **developer**,
I want the FastAPI backend structure ready with routers and config,
so that API endpoints can be added incrementally per feature.

## Acceptance Criteria

1. **Given** the backend is running
   **When** I call `GET /api/health`
   **Then** it returns `{ "status": "success", "data": { "service": "synthetica" } }`

2. **Given** the config is loaded
   **When** I check `app/config.py`
   **Then** `Settings` class loads `GOOGLE_AI_API_KEY`, `GEMINI_MODEL`, `NANO_BANANA_MODEL` from `.env`

3. **Given** the backend structure exists
   **When** I inspect `app/routers/`
   **Then** router files exist with empty router instances: `artist.py`, `audio.py`, `video.py`, `feed.py`
   **And** all routers are included in `main.py` with `/api` prefix

4. **Given** the storage module exists
   **When** I inspect `app/storage.py`
   **Then** it has `artists: dict = {}`, `clips: list = []`, `influences: list = []`

5. **Given** the media directories exist
   **When** I check the filesystem
   **Then** `media/avatars/`, `media/audio/`, `media/clips/` directories exist
   **And** `/media` is mounted as StaticFiles in FastAPI

## Tasks / Subtasks

- [x] Task 1: Config and settings (AC: #2)
  - [x] 1.1: Implement `app/config.py` with `Settings(BaseSettings)`: `google_ai_api_key: str`, `gemini_model: str = "gemini-2.0-flash"`, `nano_banana_model: str = "gemini-3.1-flash-image-preview"`, `model_config = SettingsConfigDict(env_file=".env")`
  - [x] 1.2: Create `backend/.env` from `.env.example` (gitignored) with placeholder values
- [x] Task 2: Router skeleton (AC: #3)
  - [x] 2.1: Create `app/routers/artist.py` with `router = APIRouter(prefix="/api", tags=["artists"])`
  - [x] 2.2: Create `app/routers/audio.py` with `router = APIRouter(prefix="/api", tags=["audio"])`
  - [x] 2.3: Create `app/routers/video.py` with `router = APIRouter(prefix="/api", tags=["video"])`
  - [x] 2.4: Create `app/routers/feed.py` with `router = APIRouter(prefix="/api", tags=["feed"])`
  - [x] 2.5: Include all routers in `main.py`
- [x] Task 3: Storage and media (AC: #4, #5)
  - [x] 3.1: Implement `app/storage.py` with typed in-memory storage dicts
  - [x] 3.2: Ensure `media/avatars/`, `media/audio/`, `media/clips/` directories exist (create in main.py startup or manually)
  - [x] 3.3: Mount StaticFiles for `/media` in `main.py`
- [x] Task 4: Health check (AC: #1)
  - [x] 4.1: Ensure `GET /api/health` returns correct response format

## Dev Notes

### Architecture Compliance

- **API response wrapper:** ALL endpoints must return `{ "status": "success", "data": {...} }` or `{ "status": "error", "message": "...", "detail": "..." }`
- **Router prefix:** All routers use `/api` prefix
- **Async handlers:** All route handlers must be `async def`
- **Storage isolation:** Only `storage.py` holds in-memory data. Routers import from it.

### Router Pattern

```python
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["artists"])

# Endpoints will be added by feature stories
```

### Main App Pattern

```python
from app.routers import artist, audio, video, feed

app.include_router(artist.router)
app.include_router(audio.router)
app.include_router(video.router)
app.include_router(feed.router)
```

### Storage Pattern

```python
from typing import Any

artists: dict[str, Any] = {}
clips: list[dict[str, Any]] = []
influences: list[dict[str, Any]] = []
```

### NOTE: Story 1.1 overlap

Some of these tasks may already be partially done in Story 1.1 (main.py, config.py, storage.py). If so, this story fills in the details and ensures everything is wired correctly. Do NOT duplicate — extend what exists.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries — Backend structure]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

### Completion Notes List

- Story 1.4 work was largely completed during Story 1.1 — config.py, storage.py, routers, services, main.py all created
- Config: Settings(BaseSettings) loads GOOGLE_AI_API_KEY, GEMINI_MODEL, NANO_BANANA_MODEL from .env
- All 4 routers (artist, audio, video, feed) have APIRouter with /api prefix and are included in main.py
- storage.py has typed in-memory dicts: artists (dict), clips (list), influences (list)
- Media dirs created programmatically via os.makedirs in main.py startup
- /media mounted as StaticFiles
- Health check at GET /api/health returns correct response format
- No additional code changes were needed beyond what Story 1.1 already established

### File List

- backend/app/main.py (verified — routers included, media mounted, health check)
- backend/app/config.py (verified — Settings with all env vars)
- backend/app/storage.py (verified — typed in-memory storage)
- backend/app/routers/artist.py (verified — APIRouter skeleton)
- backend/app/routers/audio.py (verified — APIRouter skeleton)
- backend/app/routers/video.py (verified — APIRouter skeleton)
- backend/app/routers/feed.py (verified — APIRouter skeleton)
