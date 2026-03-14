# Story 2.2: Avatar Generation via Nano Banana 2

Status: done

## Story

As an **artist/label A&R**,
I want to generate a consistent visual avatar for my virtual idol,
so that the artist has a recognizable face across all content.

## Acceptance Criteria

1. **Given** an artist has been created with lore (Story 2.1 complete)
   **When** I click "Generate Avatar" in the `AvatarGenerator.tsx` component
   **Then** the backend calls `POST /api/artists/{artist_id}/avatar` which triggers Nano Banana 2 via `nano_banana.py`
   **And** the generated image is saved to `media/avatars/{artist_id}_{timestamp}.png`
   **And** the API returns `{ "status": "success", "data": { "avatar_url": "/media/avatars/..." } }`

2. **Given** the avatar is generated
   **When** I view it in the frontend
   **Then** the avatar is displayed with a neon border glow (cyan, rounded circle)
   **And** the avatar URL is stored in the artist's data in `storage.py` and `useStudioStore`

3. **Given** an artist already has an avatar
   **When** I click "Regenerate Avatar"
   **Then** a new avatar is generated with the same character identity (character consistency)
   **And** both avatars are visually consistent (same face/character, different pose or angle)

4. **Given** the Nano Banana 2 API returns an error
   **When** the error is received
   **Then** the backend returns `{ "status": "error", "message": "...", "detail": "..." }` with HTTP 500
   **And** the frontend shows a toast error notification

## Tasks / Subtasks

- [x] Task 1: Backend — Nano Banana 2 service (AC: #1, #3)
  - [x] 1.1: Add `NANO_BANANA_MODEL` to `app/config.py` Settings class (default: `gemini-3.1-flash-image-preview`)
  - [x] 1.2: Create `app/services/nano_banana.py` with `async def generate_avatar(artist_name: str, artist_description: str, existing_avatar_prompt: str | None = None) -> bytes`
  - [x] 1.3: Implement image generation using `google.genai.Client` with `generate_content()` — model `gemini-3.1-flash-image-preview`, config `response_modalities=['IMAGE']`
  - [x] 1.4: Build character-consistent prompt: include artist name, physical description from lore, and style keywords. For regeneration, include reference to previous prompt for consistency.
  - [x] 1.5: Extract image bytes from response parts, return raw bytes
- [x] Task 2: Backend — Avatar models and router endpoint (AC: #1, #2)
  - [x] 2.1: Add to `app/models/artist.py`: `AvatarResponse(avatar_url: str, artist_id: str)`
  - [x] 2.2: Implement `POST /api/artists/{artist_id}/avatar` in `app/routers/artist.py`
  - [x] 2.3: Save image bytes to `media/avatars/{artist_id}_{timestamp}.png` using sync write
  - [x] 2.4: Update artist in `storage.py` with `avatar_url` and `avatar_prompt` (for consistency on regeneration)
  - [x] 2.5: Return wrapped response `{ "status": "success", "data": { "avatar_url": "/media/avatars/..." } }`
- [x] Task 3: Backend — Error handling (AC: #4)
  - [x] 3.1: Wrap Nano Banana API calls in try/except, raise `HTTPException(500)` on failure
  - [x] 3.2: Validate `artist_id` exists in storage before generating — return 404 if not found
- [x] Task 4: Frontend — AvatarGenerator component (AC: #1, #2, #3)
  - [x] 4.1: Add to `frontend/src/api/artist.ts`: `generateAvatar(artistId: string)` calling `POST /api/artists/{artist_id}/avatar`
  - [x] 4.2: Add avatar state to `useStudioStore`: `avatar_url: string | null`, `is_generating_image: boolean`, `setAvatar()`, `setGeneratingImage()`
  - [x] 4.3: Create `frontend/src/features/studio/AvatarGenerator.tsx` — "Generate Avatar" button, loading state, avatar display (circle, neon border), "Regenerate" button after first generation
  - [x] 4.4: Display avatar as 200px circle with animated neon cyan border glow (per UX spec)
  - [x] 4.5: Wire AvatarGenerator into `StudioDashboard.tsx` (show after lore is generated)
- [x] Task 5: Frontend — Error handling (AC: #4)
  - [x] 5.1: Handle API errors in `generateAvatar()`, set error state in store
  - [x] 5.2: Show toast notification on error

## Dev Notes

### Architecture Compliance

- **Service pattern:** Same as Story 2.1 — `async def generate_X(params) -> Result`. Validate input, call Google AI API, return data.
- **Router pattern:** Router calls service, saves to storage, returns wrapped response. Router never calls Google APIs directly.
- **Storage pattern:** `storage.py` is the only module that touches in-memory data. The router updates the artist dict entry with `avatar_url`.
- **API wrapper:** Always `{ "status": "success", "data": {...} }` or `{ "status": "error", "message": "...", "detail": "..." }`

### Technical Requirements — Nano Banana 2

- **SDK:** Same `google-genai` package installed in Story 2.1 — no new dependency needed
- **Model name:** `gemini-3.1-flash-image-preview` (this IS Nano Banana 2)
- **Client pattern:**
  ```python
  from google import genai
  from google.genai import types

  client = genai.Client(api_key=settings.google_ai_api_key)
  response = client.models.generate_content(
      model=settings.nano_banana_model,  # "gemini-3.1-flash-image-preview"
      contents=prompt_text,
      config=types.GenerateContentConfig(
          response_modalities=["IMAGE"],
      ),
  )
  # Extract image from response
  for part in response.candidates[0].content.parts:
      if part.inline_data:
          image_bytes = part.inline_data.data
          # Save to file
  ```
- **Character consistency strategy:** Store the avatar generation prompt with the artist data. On regeneration, reuse the same base prompt with a variation instruction ("same character, different angle/pose"). This leverages Nano Banana 2's character consistency capabilities.
- **Image format:** Save as PNG. Nano Banana 2 returns image data in the response parts as inline_data with mime_type.

### Previous Story Intelligence (Story 2.1)

- `google-genai` is already installed and in `requirements.txt`
- `app/config.py` already has `GOOGLE_AI_API_KEY` — reuse same key for Nano Banana 2
- `app/models/artist.py` already has `ArtistCreateRequest` and `LoreData` — extend, don't recreate
- `app/routers/artist.py` already has `POST /api/artists` — add the new avatar endpoint to same router
- `app/services/gemini.py` exists — `nano_banana.py` follows the same pattern
- `storage.py` artists dict already stores artist data — add `avatar_url` and `avatar_prompt` fields
- `frontend/src/api/client.ts` and `artist.ts` already exist — add `generateAvatar()` to `artist.ts`
- `useStudioStore` already has lore state — add avatar state alongside it
- `StudioDashboard.tsx` already renders `LoreGenerator` — add `AvatarGenerator` below it

### File Structure

```
backend/app/
├── config.py              # Add NANO_BANANA_MODEL setting
├── routers/
│   └── artist.py          # Add POST /api/artists/{artist_id}/avatar
├── services/
│   └── nano_banana.py     # NEW: generate_avatar()
├── models/
│   └── artist.py          # Add AvatarResponse model
└── storage.py             # Update artist dict entries with avatar_url

frontend/src/
├── api/
│   └── artist.ts          # Add generateAvatar()
├── stores/
│   └── useStudioStore.ts  # Add avatar_url, is_generating_image
└── features/studio/
    ├── StudioDashboard.tsx # Wire in AvatarGenerator
    └── AvatarGenerator.tsx # NEW component
```

### Naming Conventions

- Python: `snake_case` for variables/functions, `PascalCase` for classes
- TypeScript: `camelCase` for variables/functions, `PascalCase` for components/types
- API fields: `snake_case` (Pydantic default)
- Files: `snake_case.py` (backend), `PascalCase.tsx` (frontend components)

### Testing Requirements

- Backend: Test `POST /api/artists/{id}/avatar` with mocked Nano Banana service
- Test 404 when artist_id doesn't exist
- Test image file is saved to correct path in `media/avatars/`
- Frontend: Test `AvatarGenerator` renders button, triggers API, displays avatar image
- Test regeneration flow (button changes to "Regenerate" after first generation)
- Test error handling with toast notification

### Styling (from UX Spec)

- Avatar display: 200px circle with animated neon cyan border glow
- "Generate Avatar" button: gradient cyan-to-purple, white bold text, same style as lore button
- "Regenerate" button: secondary style (outlined, cyan border)
- Loading state: `LoadingSpinner` overlaid on avatar placeholder
- Avatar placeholder before generation: dark circle with user silhouette icon, dashed neon border

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Architecture (UX) — AvatarGenerator]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Stitch Prompt — Screen 5: Artist Profile]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2]
- [Source: _bmad-output/implementation-artifacts/2-1-lore-generation-gemini.md — Previous story patterns]
- [Source: https://ai.google.dev/gemini-api/docs/image-generation — Nano Banana / Gemini Image Generation]
- [Source: https://pypi.org/project/google-genai/ — google-genai SDK]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

### Completion Notes List

- nano_banana.py: generate_avatar() returns (image_bytes, prompt_used) tuple for consistency tracking
- Character consistency: stores avatar_prompt in backend storage dict; on regeneration appends "same character, different angle" instruction to original prompt
- Note: avatar_prompt is backend-internal state only — never exposed via API responses. Frontend ArtistData type intentionally omits it.
- Image saved as PNG to media/avatars/{artist_id}_{timestamp}.png with sync write
- Router validates artist_id exists (404), handles timeout/rate-limit (503), generic errors (500)
- AvatarGenerator: 192px circle display, dashed placeholder before generation, neon-border after
- Button switches between "Generate Avatar" (btn-primary) and "Regenerate Avatar" (outline cyan)
- Personality traits shown as cyan pill tags below avatar (first 3 traits)
- Wired into StudioDashboard right column (1/3 width), only renders when artist exists

### File List

- backend/app/services/nano_banana.py (modified — full avatar generation implementation)
- backend/app/models/artist.py (modified — added AvatarResponse)
- backend/app/routers/artist.py (modified — POST /api/artists/{artist_id}/avatar endpoint)
- frontend/src/api/artist.ts (modified — added generateAvatar function)
- frontend/src/features/studio/AvatarGenerator.tsx (new)
- frontend/src/features/studio/StudioDashboard.tsx (modified — wired AvatarGenerator)
