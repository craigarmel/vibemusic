# Story 4.1: Video Generation via Veo 3.1

Status: review

---

## Story

As an **artist**,
I want to generate a short vertical video clip from my avatar and music,
So that I have visual content for the fan feed.

---

## Acceptance Criteria

1. **AC1: Generate Clip API**
   - Given an artist has an avatar image and a published audio track
   - When I click "Generate Clip" in the `ClipGenerator.tsx` component
   - Then the frontend sends `POST /api/clips` with `{ "artist_id": "...", "track_id": "..." }`

2. **AC2: Async Task Pattern**
   - Given the backend receives a clip generation request
   - When the Veo 3.1 service processes the request
   - Then the API returns immediately with `{ "status": "success", "data": { "task_id": "..." } }`
   - And the frontend polls `GET /api/tasks/{task_id}/status` showing a progress indicator

3. **AC3: Mock Veo Service**
   - Given this is a hackathon mock implementation
   - When a clip generation is triggered
   - Then the veo.py mock service copies an existing audio file to the clips directory as a fake video
   - And returns after a 3-second delay to simulate generation time

4. **AC4: Video Preview**
   - Given video generation is complete
   - When the task status returns "completed"
   - Then the video preview plays in the ClipGenerator component
   - And the clip is stored in storage.py and linked to the artist

5. **AC5: ClipGenerator Component**
   - Given the user is on the Studio Dashboard
   - When a published track exists
   - Then the ClipGenerator component shows a "Generate Clip" button with progress indicator and video preview

---

## Tasks / Subtasks

- [x] Task 1: Create Veo mock service (AC: #3)
  - [x] Subtask 1.1: Implement `generate_clip()` in `app/services/veo.py`
  - [x] Subtask 1.2: Mock generates a WAV file copy as fake video after 3s delay
  - [x] Subtask 1.3: Return clip metadata (clip_id, video_url, status)

- [x] Task 2: Create video models (AC: #1, #2)
  - [x] Subtask 2.1: Create `app/models/video.py` with ClipGenerateRequest, TaskStatusResponse
  - [x] Subtask 2.2: Define task status enum (pending, processing, completed, failed)

- [x] Task 3: Create video router endpoints (AC: #1, #2)
  - [x] Subtask 3.1: Rewrite `POST /api/clips` for video clip generation (returns task_id)
  - [x] Subtask 3.2: Implement `GET /api/tasks/{task_id}/status` polling endpoint
  - [x] Subtask 3.3: Store task state and clip data in storage.py

- [x] Task 4: Create frontend API functions (AC: #1, #2)
  - [x] Subtask 4.1: Add `generateClip()` function to `api/video.ts`
  - [x] Subtask 4.2: Add `getTaskStatus()` function to `api/video.ts`

- [x] Task 5: Create ClipGenerator component (AC: #4, #5)
  - [x] Subtask 5.1: Create `ClipGenerator.tsx` in `features/studio/`
  - [x] Subtask 5.2: "Generate Clip" button with neon styling
  - [x] Subtask 5.3: Progress indicator during generation
  - [x] Subtask 5.4: Video/audio preview player on completion
  - [x] Subtask 5.5: Integrate with useStudioStore for loading state

---

## Dev Notes

### Mock Veo Implementation

For the hackathon, the Veo service creates a mock video by copying the track's audio file to the clips directory. This simulates the async generation pattern (task_id + polling) without requiring actual Veo 3.1 API access.

### Task Polling Pattern

The backend stores tasks in-memory. The frontend polls every 1.5 seconds until the task completes. The mock service uses `asyncio.sleep(3)` to simulate generation time.

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### File List

- `backend/app/services/veo.py`
- `backend/app/models/video.py`
- `backend/app/routers/video.py`
- `backend/app/storage.py`
- `frontend/src/api/video.ts`
- `frontend/src/features/studio/ClipGenerator.tsx`
- `frontend/src/types/video.ts`
