# Story 1.4: Backend API Skeleton with Health Check

Status: ready-for-dev

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

- [ ] Task 1: Config and settings (AC: #2)
  - [ ] 1.1: Implement `app/config.py` with `Settings(BaseSettings)`: `google_ai_api_key: str`, `gemini_model: str = "gemini-2.0-flash"`, `nano_banana_model: str = "gemini-3.1-flash-image-preview"`, `model_config = SettingsConfigDict(env_file=".env")`
  - [ ] 1.2: Create `backend/.env` from `.env.example` (gitignored) with placeholder values
- [ ] Task 2: Router skeleton (AC: #3)
  - [ ] 2.1: Create `app/routers/artist.py` with `router = APIRouter(prefix="/api", tags=["artists"])`
  - [ ] 2.2: Create `app/routers/audio.py` with `router = APIRouter(prefix="/api", tags=["audio"])`
  - [ ] 2.3: Create `app/routers/video.py` with `router = APIRouter(prefix="/api", tags=["video"])`
  - [ ] 2.4: Create `app/routers/feed.py` with `router = APIRouter(prefix="/api", tags=["feed"])`
  - [ ] 2.5: Include all routers in `main.py`
- [ ] Task 3: Storage and media (AC: #4, #5)
  - [ ] 3.1: Implement `app/storage.py` with typed in-memory storage dicts
  - [ ] 3.2: Ensure `media/avatars/`, `media/audio/`, `media/clips/` directories exist (create in main.py startup or manually)
  - [ ] 3.3: Mount StaticFiles for `/media` in `main.py`
- [ ] Task 4: Health check (AC: #1)
  - [ ] 4.1: Ensure `GET /api/health` returns correct response format

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

### Debug Log References

### Completion Notes List

### File List
