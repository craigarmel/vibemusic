# Story 5.1: Fan Feed with Vertical Video Scroll

Status: review

## Story

As a **fan**,
I want to scroll through a TikTok-style feed of AI-generated music videos,
So that I can discover new virtual artists and their music.

## Acceptance Criteria

1. **Given** published video clips exist in storage
   **When** I navigate to `/feed`
   **Then** the `FeedView` component loads clips from `GET /api/feed`

2. **Given** the feed is loaded
   **When** I view the feed
   **Then** each clip is displayed full-screen in 9:16 vertical format

3. **Given** multiple clips exist
   **When** I swipe up/down
   **Then** it navigates to the next/previous clip

4. **Given** a clip is in view
   **When** it becomes visible
   **Then** it auto-plays and pauses when scrolled away

5. **Given** the feed is displayed
   **When** I check responsiveness
   **Then** the interface is mobile-first (375px optimized) and responsive on desktop

6. **Given** the feed is visible
   **When** I look at the top
   **Then** a minimal "Synthetica" logo text in cyan is displayed

## Tasks / Subtasks

- [x] Task 1: Backend — `GET /api/feed` endpoint (AC: #1)
  - [x] 1.1: Create Pydantic models in `backend/app/models/feed.py` for feed response
  - [x] 1.2: Implement `GET /api/feed` in `backend/app/routers/feed.py` returning published clips with artist info
  - [x] 1.3: Include mock/sample data when no real clips exist (hackathon convenience)

- [x] Task 2: Frontend API layer (AC: #1)
  - [x] 2.1: Create `frontend/src/api/feed.ts` with `getFeed()` using `apiGet` from client.ts
  - [x] 2.2: Wire `useFeedStore` to receive feed data

- [x] Task 3: FeedView component — TikTok-style scroll (AC: #2, #3, #4, #5, #6)
  - [x] 3.1: Implement full-screen snap-scroll container in `FeedView.tsx`
  - [x] 3.2: Implement IntersectionObserver-based auto-play/pause for video elements
  - [x] 3.3: Add minimal "Synthetica" logo in cyan at top
  - [x] 3.4: Ensure mobile-first layout (375px optimized), responsive on desktop

## Dev Notes

### Architecture Compliance

- Backend endpoint follows API response wrapper: `{ "status": "success", "data": {...} }`
- Frontend uses `apiGet` from `client.ts` and stores data in `useFeedStore`
- Route already configured at `/feed` in `App.tsx`
- Mock data provided when no real clips exist for hackathon demo

### Technical Requirements

- CSS `scroll-snap-type: y mandatory` for TikTok-style snap scrolling
- `IntersectionObserver` API for detecting which card is in view (auto-play/pause)
- 9:16 aspect ratio maintained via CSS aspect-ratio or height constraints
- Mobile-first: 375px base, centered max-width on desktop

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
