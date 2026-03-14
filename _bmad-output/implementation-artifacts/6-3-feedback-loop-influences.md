# Story 6.3: Feedback Loop — Influences to Next Session

Status: review

---

## Story

As an **artist**,
I want to see aggregated fan influences on my profile and when starting a new session,
So that I can incorporate fan feedback into my next creative direction.

---

## Acceptance Criteria

1. **AC1: Fan Influences on Artist Profile**
   - Given the artist has received fan influences
   - When they view the ArtistProfile page
   - Then a "Fan Influences" badge shows the total count
   - And aggregated top tags are displayed as pills

2. **AC2: Backend Aggregation Endpoint**
   - Given influences have been submitted for an artist
   - When `GET /api/artists/{id}/influences` is called
   - Then the response contains aggregated tag counts sorted by popularity

3. **AC3: Top Tags on Session Start**
   - Given top tags exist for the artist
   - When starting a new session
   - Then the top influence tags are briefly shown in the SessionLauncher

---

## Tasks / Subtasks

- [x] Task 1: Backend GET /api/artists/{id}/influences endpoint (AC: #2)
  - [x] Subtask 1.1: Aggregate influence tags by count for the given artist
  - [x] Subtask 1.2: Return sorted tag counts in API response

- [x] Task 2: Update ArtistProfile with influence display (AC: #1)
  - [x] Subtask 2.1: Fetch artist influences on profile load
  - [x] Subtask 2.2: Update Fan Influences StatCard with real count
  - [x] Subtask 2.3: Display top tags as styled pills below the stat

- [x] Task 3: Show top tags in SessionLauncher (AC: #3)
  - [x] Subtask 3.1: Fetch artist influences when session launcher loads
  - [x] Subtask 3.2: Display top 3 tags as "Fan wants:" pills

- [x] Task 4: Frontend API integration (AC: #1, #2)
  - [x] Subtask 4.1: Add getArtistInfluences to api/feed.ts
  - [x] Subtask 4.2: Add influence data to useFeedStore

---

## Technical Requirements

### API Response Shape

```json
{
  "status": "success",
  "data": {
    "artist_id": "...",
    "total_influences": 42,
    "tags": [
      { "tag": "Plus de basses", "count": 15 },
      { "tag": "Electro vibes", "count": 12 },
      ...
    ]
  }
}
```

---

## File List

- `backend/app/routers/feed.py` (new endpoint)
- `frontend/src/api/feed.ts` (new function)
- `frontend/src/features/studio/ArtistProfile.tsx` (updated)
- `frontend/src/features/studio/SessionLauncher.tsx` (updated)
- `frontend/src/stores/useFeedStore.ts` (updated)
- `frontend/src/types/feed.ts` (updated)
