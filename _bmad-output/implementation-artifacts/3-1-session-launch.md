# Story 3.1: Session Launch with Camera/Mic Activation

Status: ready-for-dev

---

## Story

As an **artist**,
I want to launch a live session that activates my camera and microphone,
So that Lyria can capture my ambiance for music generation.

---

## Acceptance Criteria

1. **AC1: Session Launch Trigger**
   - Given an artist profile exists on the Studio Dashboard
   - When I click "Start New Session"
   - Then the `SessionLauncher` component requests browser camera and microphone permissions

2. **AC2: Permission Handling**
   - Given the session launcher is active
   - When browser prompts for camera/mic permissions
   - Then if permissions are granted, the app transitions to the `LiveSessionView` full-screen immersive interface
   - And if permissions are denied, an error message explains that camera/mic are required

3. **AC3: Live Session View Initialization**
   - Given permissions are granted
   - When the LiveSessionView loads
   - Then the camera feed is displayed in the center of the screen (rounded-2xl, neon cyan border glow)
   - And a session timer starts counting (monospace font, cyan glow, top center)
   - And the backend receives `POST /api/sessions` creating a new session in storage

4. **AC4: Session State Management**
   - Given a session is being created
   - When the session starts
   - Then `useStudioStore` is updated with `is_session_active: true`, `session_start_time`, and `session_id`

---

## Tasks / Subtasks

- [ ] Task 1: Create SessionLauncher component with permission request logic (AC: #1)
  - [ ] Subtask 1.1: Implement browser MediaDevices.getUserMedia() call
  - [ ] Subtask 1.2: Add permission denied error handling with user-friendly message
  - [ ] Subtask 1.3: Style the "Start New Session" CTA button (gradient cyan-to-purple, neon glow)

- [ ] Task 2: Create LiveSessionView full-screen component (AC: #2, #3)
  - [ ] Subtask 2.1: Implement full-screen layout with camera feed centered
  - [ ] Subtask 2.2: Add neon cyan border glow to camera container (rounded-2xl)
  - [ ] Subtask 2.3: Implement session timer with monospace font and cyan glow
  - [ ] Subtask 2.4: Add session timer logic (start counting from 00:00)

- [ ] Task 3: Backend session creation endpoint (AC: #4)
  - [ ] Subtask 3.1: Create `POST /api/sessions` endpoint in `audio.py` router
  - [ ] Subtask 3.2: Create session model with `session_id`, `artist_id`, `start_time`, `status`
  - [ ] Subtask 3.3: Store session in `storage.py` in-memory storage
  - [ ] Subtask 3.4: Return session data with proper API response wrapper

- [ ] Task 4: Zustand store integration (AC: #4)
  - [ ] Subtask 4.1: Extend `useStudioStore` with session state
  - [ ] Subtask 4.2: Add actions: `startSession()`, `endSession()`, `updateSessionTime()`

---

## Dev Notes

### Browser Media API

```typescript
// Request camera and microphone permissions
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: 1280, height: 720 },
  audio: { echoCancellation: true, noiseSuppression: true }
});

// Stop stream when session ends
stream.getTracks().forEach(track => track.stop());
```

### Session State Structure

```typescript
// useStudioStore session state
interface SessionState {
  session_id: string | null;
  is_session_active: boolean;
  session_start_time: number | null; // Unix timestamp
  camera_stream: MediaStream | null;
}
```

### Backend Session Model

```python
# models/audio.py
class SessionCreateRequest(BaseModel):
    artist_id: str

class SessionResponse(BaseModel):
    session_id: str
    artist_id: str
    start_time: datetime
    status: str  # "active" | "completed"
```

### Camera Feed Styling

```tsx
// Camera container with neon border glow
<div className="relative rounded-2xl border-4 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.5)] overflow-hidden">
  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
</div>
```

### Session Timer Format

```typescript
// Format seconds to MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};
```

---

## Technical Requirements

### Project Structure

**Frontend:**
- `frontend/src/features/studio/SessionLauncher.tsx` - Session launch component
- `frontend/src/features/studio/LiveSessionView.tsx` - Full-screen live session view
- `frontend/src/hooks/useCamera.ts` - Camera permission and stream hook

**Backend:**
- `backend/app/routers/audio.py` - Session creation endpoint
- `backend/app/models/audio.py` - Session request/response models
- `backend/app/services/session.py` - Session management service (optional)

### API Endpoint

```python
# POST /api/sessions
@router.post("/sessions")
async def create_session(request: SessionCreateRequest):
    session_id = generate_uuid()
    session = {
        "session_id": session_id,
        "artist_id": request.artist_id,
        "start_time": datetime.now(),
        "status": "active"
    }
    storage.sessions[session_id] = session
    return {"status": "success", "data": session}
```

### Dependencies

- No additional dependencies required (browser MediaDevices API is native)
- Uses existing Zustand for state management

---

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 3: Live Music Session]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- MDN: MediaDevices.getUserMedia() - https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

- `frontend/src/features/studio/SessionLauncher.tsx`
- `frontend/src/features/studio/LiveSessionView.tsx`
- `frontend/src/hooks/useCamera.ts`
- `backend/app/routers/audio.py`
- `backend/app/models/audio.py`
