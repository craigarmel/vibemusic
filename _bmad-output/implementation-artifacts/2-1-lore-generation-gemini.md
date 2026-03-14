# Story 2.1: Lore Generation via Gemini 3

Status: done

## Story

As an **artist/label A&R**,
I want to type a creative prompt and receive a generated biography, personality traits, and lyrics,
so that I can build the identity of my virtual idol.

## Acceptance Criteria

1. **Given** the backend is running and Gemini API key is configured in `.env`
   **When** I send `POST /api/artists` with `{ "prompt": "Fille cyborg de Neo-Paris, fait de la techno triste" }`
   **Then** the backend calls Gemini via `gemini.py` service and returns `{ "status": "success", "data": { "artist_id": "...", "lore": { "name": "...", "biography": "...", "personality_traits": [...], "lyrics": "..." } } }`

2. **Given** a successful lore generation
   **When** the response is received
   **Then** the artist is stored in `storage.py` in-memory dict keyed by `artist_id`

3. **Given** the Studio Dashboard is open
   **When** I type a prompt in the `LoreGenerator.tsx` text input and click "Generate"
   **Then** a loading state (`is_generating_lore: true`) is shown
   **And** the API is called and the generated lore (name, biography, traits, lyrics) is displayed
   **And** the result is saved to `useStudioStore`

4. **Given** the Gemini API returns an error
   **When** the error is received
   **Then** the backend returns `{ "status": "error", "message": "...", "detail": "..." }` with HTTP 500
   **And** the frontend shows a toast error notification

## Tasks / Subtasks

- [x] Task 1: Backend — Gemini service (AC: #1)
  - [x] 1.1: Install `google-genai` package and add to `requirements.txt`
  - [x] 1.2: Add `GOOGLE_AI_API_KEY` and `GEMINI_MODEL` to `app/config.py` Settings class
  - [x] 1.3: Create `app/services/gemini.py` with `async def generate_lore(prompt: str) -> dict` function
  - [x] 1.4: Implement Gemini API call using `google.genai.Client` with structured prompt for lore generation (name, biography, personality_traits, lyrics)
- [x] Task 2: Backend — Artist models and router (AC: #1, #2)
  - [x] 2.1: Create `app/models/artist.py` with Pydantic models: `ArtistCreateRequest(prompt: str)`, `LoreData(name, biography, personality_traits, lyrics)`, `ArtistResponse`
  - [x] 2.2: Implement `POST /api/artists` endpoint in `app/routers/artist.py`
  - [x] 2.3: Store artist in `storage.py` artists dict with generated UUID as key
  - [x] 2.4: Return wrapped response `{ "status": "success", "data": { "artist_id": "...", "lore": {...} } }`
- [x] Task 3: Backend — Error handling (AC: #4)
  - [x] 3.1: Wrap Gemini API calls in try/except, raise `HTTPException(500)` with error detail on failure
  - [x] 3.2: Handle timeout/rate-limit scenarios with `HTTPException(503)`
- [x] Task 4: Frontend — LoreGenerator component (AC: #3)
  - [x] 4.1: Create `frontend/src/api/client.ts` — fetch wrapper with base URL from `VITE_API_URL` env var
  - [x] 4.2: Create `frontend/src/api/artist.ts` — `createArtist(prompt: string)` function calling `POST /api/artists`
  - [x] 4.3: Add lore state and actions to `useStudioStore` (artist data, `is_generating_lore` flag, `setLore`, `setGeneratingLore`)
  - [x] 4.4: Create `frontend/src/features/studio/LoreGenerator.tsx` — text input, "Generate" button, loading spinner, lore display
  - [x] 4.5: Wire LoreGenerator into `StudioDashboard.tsx`
- [x] Task 5: Frontend — Error handling (AC: #4)
  - [x] 5.1: Handle API errors in `createArtist()`, set error state in store
  - [x] 5.2: Show toast notification on error using `Toast.tsx` component

## Dev Notes

### Architecture Compliance

- **Backend pattern:** All AI services follow the same shape: `async def generate_X(params) -> Result` — validate input, call API, return data
- **API response wrapper:** Always use `{ "status": "success", "data": {...} }` or `{ "status": "error", "message": "...", "detail": "..." }`
- **Router responsibility:** Routers orchestrate services and store data. Services return data, routers call `storage.py`
- **Async required:** All API handlers and service calls must be `async def`

### Technical Requirements

- **Python SDK:** Use `google-genai` package (v1.67+), NOT the deprecated `google-generativeai`
- **Client pattern:**
  ```python
  from google import genai
  client = genai.Client(api_key=settings.google_ai_api_key)
  response = client.models.generate_content(
      model=settings.gemini_model,  # "gemini-2.0-flash" or "gemini-3-flash-preview"
      contents=prompt_text,
  )
  ```
- **Model:** Use `gemini-2.0-flash` as default (stable). The `gemini-3-flash-preview` may also work but is preview. Set via `GEMINI_MODEL` env var so it's configurable.
- **Structured output:** Prompt Gemini to return JSON with specific fields: `name`, `biography`, `personality_traits` (array of strings), `lyrics` (string). Parse the response text as JSON.

### File Structure (from Architecture)

```
backend/app/
├── config.py           # Add GOOGLE_AI_API_KEY, GEMINI_MODEL
├── routers/
│   └── artist.py       # POST /api/artists
├── services/
│   └── gemini.py       # generate_lore()
├── models/
│   └── artist.py       # ArtistCreateRequest, LoreData, ArtistResponse
└── storage.py          # artists dict — already has structure from Story 1.4

frontend/src/
├── api/
│   ├── client.ts       # Fetch wrapper (new)
│   └── artist.ts       # createArtist() (new)
├── stores/
│   └── useStudioStore.ts  # Add lore state + actions
└── features/studio/
    ├── StudioDashboard.tsx  # Wire in LoreGenerator
    └── LoreGenerator.tsx    # New component
```

### Naming Conventions

- Python: `snake_case` for variables/functions, `PascalCase` for classes
- TypeScript: `camelCase` for variables/functions, `PascalCase` for components/types
- API fields: `snake_case` (Pydantic default)
- Files: `snake_case.py` (backend), `PascalCase.tsx` (frontend components)

### Testing Requirements

- Backend: Test `POST /api/artists` with mocked Gemini service (use `pytest` + `httpx.AsyncClient`)
- Frontend: Test `LoreGenerator` renders input, triggers API call, displays result (use Vitest)
- Test error handling: mock Gemini failure, verify 500 response and frontend toast

### Styling (from UX Spec)

- LoreGenerator component follows Neon Studio theme: dark background, cyan accents
- Text input: dark glass morphism styling, neon border on focus
- "Generate" button: gradient cyan-to-purple, white bold text
- Loading state: `LoadingSpinner` component with cyan glow
- Lore display: glass morphism card, white text, personality traits as cyan pills

### Project Structure Notes

- This is the FIRST story that creates actual API endpoints and frontend features
- `client.ts` API wrapper will be reused by all subsequent stories — make it clean and generic
- `useStudioStore` additions must follow Zustand pattern established in Story 1.3
- Prerequisite: Epic 1 stories (1.1-1.4) must be complete — project scaffold, design system, routing, backend skeleton

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Architecture (UX)]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1]
- [Source: https://ai.google.dev/gemini-api/docs/quickstart — Gemini API Quickstart]
- [Source: https://pypi.org/project/google-genai/ — google-genai v1.67+]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

### Completion Notes List

- google-genai SDK installed, Gemini client uses settings.google_ai_api_key
- Structured prompt template returns JSON with name, biography, personality_traits, lyrics
- JSON response cleanup handles markdown code block wrapping from Gemini
- Pydantic models: ArtistCreateRequest, LoreData, ArtistResponse in models/artist.py
- POST /api/artists generates UUID, validates lore via LoreData model, stores in storage.artists
- Error handling: 503 for timeout/rate-limit, 500 for other failures
- Frontend: fetch-based API client (client.ts), createArtist wrapper (artist.ts)
- LoreGenerator: textarea prompt, generate button with loading spinner, lore display (bio, traits with progress bars, lyrics)
- Wired into StudioDashboard grid layout (2/3 width left column)
- Toast error notifications via useStudioStore.error state

### File List

- backend/app/services/gemini.py (modified — full lore generation implementation)
- backend/app/models/artist.py (new — ArtistCreateRequest, LoreData, ArtistResponse)
- backend/app/routers/artist.py (modified — POST /api/artists endpoint)
- backend/requirements.txt (modified — added google-genai)
- frontend/src/api/client.ts (new — fetch wrapper with apiPost, apiGet)
- frontend/src/api/artist.ts (new — createArtist function)
- frontend/src/features/studio/LoreGenerator.tsx (new)
- frontend/src/features/studio/StudioDashboard.tsx (modified — wired LoreGenerator)
