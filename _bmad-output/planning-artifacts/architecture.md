---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-14'
inputDocuments:
  - prd.md
workflowType: 'architecture'
project_name: 'vibemusic'
user_name: 'Saphirdev'
date: '2026-03-14'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- FR1: Lore Generation — Text-to-text via Gemini 3 (biography, personality traits, lyrics)
- FR2: Visual Identity — Text-to-image via Nano Banana 2 with character consistency
- FR3: Real-time Music Studio — Live audio generation/modification via Lyria RealTime API with slider controls
- FR4: Video Clip Generation — Multi-modal composition via Veo 3.1 (image + audio -> 9:16 vertical video)
- FR5: Fan Feed — TikTok-style vertical scroll interface consuming generated video content
- FR6: Fan Influence — Interactive feedback mechanism (tags) that loops back to creator dashboard

**Non-Functional Requirements:**
- Real-time audio streaming with sub-second parameter response (Lyria sliders)
- Video generation within demo-acceptable timeframes (Veo 3.1)
- Character consistency across multiple image generations (Nano Banana 2)
- Mobile-first responsive design for B2C feed
- Dark/neon aesthetic (music studio style)
- Hackathon-grade: no auth, no complex DB, mock data where AI is not required

**Scale & Complexity:**

- Primary domain: Full-stack web application
- Complexity level: Medium (multi-API AI orchestration + real-time streaming)
- Estimated architectural components: 6-8 (frontend x2, backend API, AI service layer, media storage, real-time audio handler)

### Technical Constraints & Dependencies

- Must use Google AI APIs exclusively (Gemini 3, Nano Banana 2, Lyria RealTime, Veo 3.1)
- Frontend: React/Next.js + TailwindCSS (Streamlit forbidden)
- Backend: Node.js/Express or Python FastAPI
- GCP credits available via hackathon rules
- 4-hour build window with 3-minute live demo
- Deployment target: Vercel

### Cross-Cutting Concerns Identified

- **AI API orchestration**: Sequential pipeline (text -> image -> audio -> video) with error handling at each stage
- **Media asset management**: Generated images, audio streams, and video clips need temporary storage and serving
- **Real-time communication**: WebSocket or SSE needed for Lyria audio streaming and slider parameter sync
- **Content pipeline B2B->B2C**: Generated assets from Creator Studio must flow to Fan Feed
- **Latency management**: Video generation (Veo) is likely the bottleneck — demo flow must account for generation time

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application: **Vite + React (TypeScript)** frontend + **Python FastAPI** backend in a monorepo.

### Starter Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **Official `create-vite` + manual FastAPI** | Minimal, latest Vite 8, zero bloat, full control | Need to wire Tailwind + FastAPI manually |
| **Full Stack FastAPI Template** (fastapi/full-stack-fastapi-template) | Official, Docker, CI/CD, SQLModel | Overkill for hackathon, uses React+Next.js not Vite, heavy setup |
| **Community monorepo templates** | Pre-wired | Often outdated, opinionated, extra deps |

### Selected Starter: `create-vite` (react-ts) + manual FastAPI setup

**Rationale:**
- Hackathon = speed. No time debugging someone else's template choices
- `create-vite` gives you Vite 8 + React + TypeScript out of the box
- Tailwind v4 is now a simple Vite plugin (`@tailwindcss/vite`) — 2 lines of config
- FastAPI needs minimal boilerplate — a `main.py` and a `requirements.txt`
- Full control over monorepo structure, no unnecessary abstractions

**Initialization Commands:**

```bash
# Frontend (from project root)
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install tailwindcss @tailwindcss/vite

# Backend (from project root)
mkdir -p backend
pip install fastapi uvicorn python-multipart
```

**Monorepo Structure:**

```
vibemusic/
├── frontend/          # Vite + React + TypeScript + Tailwind v4
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
├── backend/           # Python FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   └── services/
│   └── requirements.txt
├── _bmad/             # BMAD method
├── _bmad-output/      # Planning artifacts
└── docs/
```

**Architectural Decisions Provided by Starter:**

- **Language & Runtime:** TypeScript (frontend), Python 3.12+ (backend)
- **Styling Solution:** Tailwind CSS v4 via `@tailwindcss/vite` plugin — no PostCSS config needed, just `@import "tailwindcss"` in CSS
- **Build Tooling:** Vite 8 (frontend), Uvicorn (backend dev server)
- **Testing Framework:** Vitest (frontend, included with Vite), Pytest (backend)
- **Code Organization:** Feature-based folders in both frontend and backend
- **Development Experience:** Vite HMR for frontend, Uvicorn `--reload` for backend

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- AI API communication pattern (REST + WebSocket)
- Async-first backend architecture
- Frontend state management and routing
- Monorepo structure with clear frontend/backend separation

**Important Decisions (Shape Architecture):**
- Media file serving strategy (local filesystem via FastAPI)
- Dev experience (Vite proxy to backend)
- Environment configuration pattern

**Deferred Decisions (Post-MVP):**
- Database (Supabase if time permits)
- Image/media cloud storage (Cloudinary if time permits)
- CI/CD pipeline
- Monitoring/observability

### Data Architecture

- **Storage:** In-memory (Python dicts/lists) + local filesystem for generated media assets
- **Media serving:** FastAPI `StaticFiles` mount for generated images, audio, video clips
- **Future path:** Supabase (DB) + Cloudinary (media) can be added by swapping the service layer
- **No migrations, no ORM** — hackathon simplicity

### Authentication & Security

- **Auth:** None — hardcoded session for hackathon demo
- **API keys:** Google AI API keys in `.env`, loaded via Pydantic `BaseSettings`
- **CORS:** FastAPI `CORSMiddleware` allowing Vite dev server origin (`localhost:5173`)
- **No rate limiting, no encryption** — hackathon scope

### API & Communication Patterns

- **REST API** for all standard operations (lore generation, image generation, video generation, feed retrieval)
- **WebSocket** for Lyria RealTime audio streaming + slider parameter sync (bidirectional)
- **Async throughout:** All AI API calls via `httpx.AsyncClient`, no blocking handlers
- **Long-running tasks (Veo):** Return task ID immediately, poll `/api/tasks/{id}/status` for progress
- **Error handling:** Standard HTTP status codes + JSON error body from FastAPI

### Frontend Architecture

- **State Management:** Zustand — one store for studio state (artist lore, image, audio, video), one for feed state
- **Routing:** React Router v7 — `/studio` (B2B dashboard), `/feed` (B2C TikTok view)
- **Component Architecture:** Feature-based folders (`src/features/studio/`, `src/features/feed/`), shared UI in `src/components/`
- **Real-time Audio:** Custom WebSocket hook for Lyria connection, slider components dispatch params on change
- **Styling:** Tailwind v4 — dark/neon theme (music studio aesthetic)

### Infrastructure & Deployment

- **Frontend:** Vercel (static Vite build)
- **Backend:** Railway (persistent server, WebSocket support)
- **Dev proxy:** Vite config proxies `/api` to `localhost:8000`
- **Env config:** `.env` + Pydantic `BaseSettings` (backend), `VITE_` prefixed vars (frontend)
- **CI/CD:** Manual deploy for hackathon
- **Logging:** FastAPI built-in logging, no external tooling

### Decision Impact Analysis

**Implementation Sequence:**
1. Project init (Vite + FastAPI scaffold)
2. Backend API skeleton with async handlers
3. Google AI API service integrations (Gemini, Nano Banana, Lyria, Veo)
4. WebSocket endpoint for Lyria real-time
5. Frontend Studio dashboard (B2B)
6. Frontend Fan Feed (B2C)
7. End-to-end integration + demo prep

**Cross-Component Dependencies:**
- Frontend WebSocket hook depends on backend WebSocket endpoint
- Video generation (Veo) depends on image (Nano Banana) + audio (Lyria) outputs
- Fan Feed depends on Creator Studio having generated content
- Vite proxy config must match backend API route prefix (`/api`)

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

12 areas where AI agents could make different choices, all resolved below.

### Naming Patterns

**API Naming Conventions:**
- Plural nouns for resources: `/api/artists`, `/api/clips`, `/api/fan-feed`
- kebab-case for multi-word endpoints
- Route params: `{id}` (FastAPI default)
- Query params: `snake_case`

**Code Naming Conventions:**

| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript variables/functions | camelCase | `generateLore()`, `artistData` |
| React components | PascalCase | `StudioDashboard`, `FanFeed` |
| TypeScript types/interfaces | PascalCase | `ArtistProfile`, `LoreResponse` |
| Component files | PascalCase.tsx | `StudioDashboard.tsx` |
| Python variables/functions | snake_case | `generate_lore()`, `artist_data` |
| Python classes/models | PascalCase | `ArtistProfile`, `LoreRequest` |
| Python files | snake_case.py | `nano_banana.py` |

**JSON/API Field Naming:**
- `snake_case` for all API request/response fields (FastAPI/Pydantic default)
- Frontend consumes snake_case directly

### Structure Patterns

**Frontend (`frontend/src/`):**
```
src/
├── features/
│   ├── studio/        # B2B Creator Studio components
│   └── feed/          # B2C Fan Feed components
├── components/        # Shared UI components
├── hooks/             # Custom React hooks (useWebSocket, etc.)
├── api/               # API client functions
├── stores/            # Zustand stores
└── types/             # Shared TypeScript types
```

**Backend (`backend/app/`):**
```
app/
├── main.py            # FastAPI app, CORS, static files mount
├── config.py          # Pydantic BaseSettings
├── routers/
│   ├── artist.py      # POST /api/artists (lore + image)
│   ├── audio.py       # WebSocket /api/audio/stream
│   ├── video.py       # POST /api/clips, GET /api/tasks/{id}/status
│   └── feed.py        # GET /api/feed
├── services/
│   ├── gemini.py      # Gemini 3 text generation
│   ├── nano_banana.py # Nano Banana 2 image generation
│   ├── lyria.py       # Lyria RealTime audio streaming
│   └── veo.py         # Veo 3.1 video generation
└── models/            # Pydantic request/response schemas
```

**Tests:** Co-located with source files
- Frontend: `StudioDashboard.test.tsx` next to `StudioDashboard.tsx`
- Backend: `tests/` folder at backend root with `test_artist.py`, `test_audio.py`, etc.

### Format Patterns

**API Success Response:**
```json
{
  "status": "success",
  "data": { ... }
}
```

**API Error Response:**
```json
{
  "status": "error",
  "message": "Human readable error",
  "detail": "Technical detail (optional)"
}
```

**WebSocket Message Format:**
```json
{
  "type": "audio_params_update",
  "payload": { "tempo": 120, "intensity": 0.8 }
}
```

WebSocket message types: `audio_params_update`, `audio_stream_start`, `audio_stream_stop`, `audio_chunk`

### Communication Patterns

**State Management (Zustand):**
- Two stores: `useStudioStore` (artist creation state), `useFeedStore` (feed content state)
- Each store tracks granular loading states: `is_generating_lore`, `is_generating_image`, `is_generating_audio`, `is_generating_video`
- Immutable updates via Zustand's built-in immer-less pattern

### Process Patterns

**Error Handling:**
- Backend: `HTTPException` with consistent codes — `400` (bad input), `404` (not found), `500` (AI API failure), `503` (AI API timeout)
- Frontend: try/catch in API calls, error state in Zustand, toast notifications for user-facing errors

**AI Service Pattern (all services follow this shape):**
```python
async def generate_X(params: XRequest) -> XResponse:
    # 1. Validate input (Pydantic handles this)
    # 2. Call Google AI API via httpx.AsyncClient
    # 3. Save generated asset to /media/{type}/{filename}
    # 4. Return asset path + metadata
```

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow the naming conventions table above — no exceptions
- Use the API response wrapper format for all endpoints
- Place files in the correct directory per the structure patterns
- Use async functions for all AI API calls
- Follow the AI service pattern shape for new service integrations

**Anti-Patterns:**
- Do NOT create utility/helper files unless shared by 3+ features
- Do NOT add a database layer — use in-memory storage
- Do NOT add authentication middleware
- Do NOT use `camelCase` in Python or `snake_case` in React component names

## Project Structure & Boundaries

### Complete Project Directory Structure

```
vibemusic/
├── .env.example
├── .gitignore
├── README.md
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── .env.example               # VITE_API_URL=http://localhost:8000
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── main.tsx                # App entry point
│       ├── App.tsx                 # Router setup
│       ├── index.css               # @import "tailwindcss" + theme vars
│       ├── api/
│       │   ├── client.ts           # Axios/fetch wrapper, base URL config
│       │   ├── artist.ts           # createArtist(), generateLore(), generateAvatar()
│       │   ├── audio.ts            # WebSocket connection helpers
│       │   ├── video.ts            # generateClip(), getTaskStatus()
│       │   └── feed.ts             # getFeed(), submitInfluence()
│       ├── stores/
│       │   ├── useStudioStore.ts   # Artist creation state (lore, image, audio, video)
│       │   └── useFeedStore.ts     # Feed content + influence state
│       ├── hooks/
│       │   ├── useWebSocket.ts     # Generic WebSocket hook
│       │   └── useLyriaStream.ts   # Lyria-specific audio streaming hook
│       ├── types/
│       │   ├── artist.ts           # ArtistProfile, LoreData, AvatarData
│       │   ├── audio.ts            # AudioParams, WebSocketMessage
│       │   ├── video.ts            # ClipData, TaskStatus
│       │   └── feed.ts             # FeedItem, InfluenceTag
│       ├── components/
│       │   ├── Layout.tsx          # App shell (dark/neon theme)
│       │   ├── Slider.tsx          # Reusable slider component
│       │   ├── LoadingSpinner.tsx   # Shared loading indicator
│       │   └── Toast.tsx           # Toast notification component
│       └── features/
│           ├── studio/
│           │   ├── StudioDashboard.tsx    # Main B2B view (orchestrates sub-components)
│           │   ├── LoreGenerator.tsx      # Prompt input + lore display
│           │   ├── AvatarGenerator.tsx    # Avatar generation + consistency preview
│           │   ├── MusicStudio.tsx        # Lyria controls + audio player
│           │   └── ClipGenerator.tsx      # Video generation trigger + preview
│           └── feed/
│               ├── FeedView.tsx           # TikTok-style vertical scroll
│               ├── FeedCard.tsx           # Single video card (9:16)
│               └── InfluenceButton.tsx    # "Orienter le prochain son" interaction
│
├── backend/
│   ├── requirements.txt            # fastapi, uvicorn, httpx, python-multipart, pydantic-settings
│   ├── .env.example                # GOOGLE_AI_API_KEY=, GEMINI_MODEL=, etc.
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app, CORS, StaticFiles mount, router includes
│   │   ├── config.py               # Settings(BaseSettings) — all env vars
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── artist.py           # POST /api/artists (lore + avatar generation)
│   │   │   ├── audio.py            # WS /api/audio/stream (Lyria real-time)
│   │   │   ├── video.py            # POST /api/clips, GET /api/tasks/{id}/status
│   │   │   └── feed.py             # GET /api/feed, POST /api/feed/influence
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── gemini.py           # Gemini 3 — generate_lore(), generate_lyrics()
│   │   │   ├── nano_banana.py      # Nano Banana 2 — generate_avatar()
│   │   │   ├── lyria.py            # Lyria RealTime — stream_audio(), update_params()
│   │   │   └── veo.py              # Veo 3.1 — generate_clip(), check_status()
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── artist.py           # ArtistCreateRequest, LoreResponse, AvatarResponse
│   │   │   ├── audio.py            # AudioParamsUpdate, AudioStreamMessage
│   │   │   ├── video.py            # ClipRequest, ClipResponse, TaskStatusResponse
│   │   │   └── feed.py             # FeedResponse, InfluenceRequest
│   │   └── storage.py              # In-memory store (artists dict, clips list, influence data)
│   ├── media/                      # Generated assets (gitignored)
│   │   ├── avatars/                # Generated artist images
│   │   ├── audio/                  # Generated audio files
│   │   └── clips/                  # Generated video clips
│   └── tests/
│       ├── test_artist.py
│       ├── test_audio.py
│       ├── test_video.py
│       └── test_feed.py
│
├── _bmad/                          # BMAD method (read-only)
├── _bmad-output/                   # Planning & implementation artifacts
│   ├── planning-artifacts/
│   └── implementation-artifacts/
└── docs/
```

### Architectural Boundaries

**API Boundaries:**
- All frontend-to-backend communication goes through `/api/*` prefix
- REST endpoints: `/api/artists`, `/api/clips`, `/api/feed`, `/api/tasks/{id}/status`
- WebSocket endpoint: `/api/audio/stream`
- Media assets served via `/media/*` (FastAPI StaticFiles)

**Component Boundaries:**
- `StudioDashboard.tsx` orchestrates all studio sub-components but each sub-component manages its own API calls
- `FeedView.tsx` owns the scroll logic, `FeedCard.tsx` owns individual video playback
- Zustand stores are the single source of truth — components read from stores, API calls write to stores

**Service Boundaries (Backend):**
- Each service in `services/` talks to exactly one Google AI API
- Routers in `routers/` orchestrate services but never call Google APIs directly
- `storage.py` is the only module that touches in-memory data — services return data, routers store it

**Data Flow:**
```
User Input → Frontend Component → API Client → FastAPI Router → AI Service → Google AI API
                                                     ↓
                                              storage.py (save)
                                                     ↓
                                              /media/ (asset file)
                                                     ↓
                                              Response → Zustand Store → UI Update
```

### Requirements to Structure Mapping

| Requirement | Router | Service | Frontend Component | Store |
|-------------|--------|---------|-------------------|-------|
| FR1: Lore | `artist.py` | `gemini.py` | `LoreGenerator.tsx` | `useStudioStore` |
| FR2: Avatar | `artist.py` | `nano_banana.py` | `AvatarGenerator.tsx` | `useStudioStore` |
| FR3: Music | `audio.py` | `lyria.py` | `MusicStudio.tsx` | `useStudioStore` |
| FR4: Video | `video.py` | `veo.py` | `ClipGenerator.tsx` | `useStudioStore` |
| FR5: Feed | `feed.py` | — | `FeedView.tsx` | `useFeedStore` |
| FR6: Influence | `feed.py` | — | `InfluenceButton.tsx` | `useFeedStore` |

### Development Workflow

**Dev servers (run in parallel):**
```bash
# Terminal 1 — Frontend
cd frontend && npm run dev          # Vite on :5173

# Terminal 2 — Backend
cd backend && uvicorn app.main:app --reload --port 8000
```

**Vite proxy config** (`frontend/vite.config.ts`):
```typescript
server: {
  proxy: {
    '/api': 'http://localhost:8000',
    '/media': 'http://localhost:8000',
  }
}
```

**Deployment:**
- Frontend: `cd frontend && npm run build` → deploy `dist/` to Vercel
- Backend: Push to Railway, set `GOOGLE_AI_API_KEY` env var, start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- Vite 8 + React + TypeScript + Tailwind v4 — all compatible, latest versions
- Python FastAPI + httpx async + Pydantic v2 — all compatible, async-first
- Zustand + React Router v7 — lightweight, no conflicts
- WebSocket support native in both FastAPI and browser — no extra dependencies needed
- Vite proxy to FastAPI works seamlessly for dev, Vercel + Railway for production

**Pattern Consistency:**
- snake_case API fields align with FastAPI/Pydantic defaults — zero config
- PascalCase React components + camelCase TS variables follow ecosystem conventions
- Feature-based folder structure consistent in both frontend and backend
- API response wrapper format is simple and consistent across all endpoints

**Structure Alignment:**
- Project tree maps 1:1 with all architectural decisions
- Every service file maps to exactly one Google AI API
- Every router file maps to a clear domain boundary
- Frontend features map directly to the two user personas (B2B studio, B2C feed)

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

| FR | Architecture Support | Status |
|----|---------------------|--------|
| FR1: Lore Generation | `gemini.py` → `artist.py` → `LoreGenerator.tsx` | ✅ Covered |
| FR2: Visual Identity | `nano_banana.py` → `artist.py` → `AvatarGenerator.tsx` | ✅ Covered |
| FR3: Real-time Music | `lyria.py` → `audio.py` (WebSocket) → `MusicStudio.tsx` | ✅ Covered |
| FR4: Video Clip | `veo.py` → `video.py` (async task) → `ClipGenerator.tsx` | ✅ Covered |
| FR5: Fan Feed | `feed.py` → `FeedView.tsx` + `FeedCard.tsx` | ✅ Covered |
| FR6: Fan Influence | `feed.py` → `InfluenceButton.tsx` | ✅ Covered |

**Non-Functional Requirements Coverage:**

| NFR | Architecture Support | Status |
|-----|---------------------|--------|
| Real-time audio | WebSocket + Lyria service | ✅ Covered |
| Video generation latency | Async task pattern with polling | ✅ Covered |
| Character consistency | Nano Banana 2 service (single API responsibility) | ✅ Covered |
| Mobile-first B2C | Tailwind responsive + feature separation | ✅ Covered |
| Dark/neon aesthetic | Tailwind theme vars in index.css | ✅ Covered |
| No auth/simple DB | In-memory storage, no auth middleware | ✅ Covered |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All technology choices documented with versions (Vite 8, Tailwind v4, FastAPI, React Router v7)
- Implementation patterns comprehensive: naming, structure, format, communication, process
- Consistency rules clear with concrete examples and anti-patterns
- AI service pattern shape defined for all 4 Google AI integrations

**Structure Completeness:**
- Complete file tree with 40+ files/directories defined
- Every file has a clear purpose annotation
- Integration points specified (Vite proxy, API prefix, media mount)
- Component boundaries well-defined (stores as single source of truth)

**Pattern Completeness:**
- 12 conflict points identified and resolved
- Naming conventions table covers all contexts (TS, React, Python)
- WebSocket message format standardized with typed message types
- Error handling patterns defined for both frontend and backend

### Gap Analysis Results

**No critical gaps found.**

**Important gaps (addressable post-MVP):**
- No database migration path documented in detail (Supabase integration deferred)
- No Cloudinary integration pattern defined yet (deferred)
- No E2E testing strategy (acceptable for hackathon)

**Nice-to-have gaps:**
- No API documentation setup (Swagger/OpenAPI auto-generated by FastAPI anyway)
- No frontend component documentation (Storybook — not needed for hackathon)

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Clean separation of concerns (each service = one AI API)
- Async-first design handles real-time + long-running tasks naturally
- Minimal complexity — no over-engineering for hackathon scope
- Clear data flow from user input to AI generation to UI display
- 4 team members can work in parallel on independent components

**Areas for Future Enhancement:**
- Database layer (Supabase) when persistence is needed
- Cloud media storage (Cloudinary) for production scale
- CI/CD pipeline for automated deployment
- E2E testing with Playwright

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
```bash
# Step 1: Initialize frontend
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install tailwindcss @tailwindcss/vite zustand react-router-dom

# Step 2: Initialize backend
mkdir -p backend/app/{routers,services,models} backend/media/{avatars,audio,clips} backend/tests
pip install fastapi uvicorn httpx python-multipart pydantic-settings
```
