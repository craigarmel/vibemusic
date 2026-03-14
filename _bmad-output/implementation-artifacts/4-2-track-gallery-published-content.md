# Story 4.2: Track Gallery with Published Content

Status: review

---

## Story

As an **artist**,
I want to see all my published tracks and video clips,
So that I can manage my artist's content catalog.

---

## Acceptance Criteria

1. **AC1: Track Gallery Grid**
   - Given an artist has published tracks and/or video clips
   - When I view the Artist Profile page
   - Then a `TrackGallery` component shows a grid (2 columns) of track cards

2. **AC2: Track Card Design**
   - Given track cards are displayed
   - When I look at a card
   - Then each card displays: dark glass morphism background, small waveform visual, track name, duration, and influence tag count badge (pink)

3. **AC3: Track Card Interaction**
   - Given a track card is displayed
   - When I click a track card
   - Then it plays the audio or video preview

4. **AC4: Card Ordering**
   - Given multiple tracks exist
   - When viewing the gallery
   - Then cards are ordered by most recent first

5. **AC5: Feed API**
   - Given published clips exist in storage
   - When the feed endpoint is called
   - Then `GET /api/feed` returns all published clips with artist and track metadata

---

## Tasks / Subtasks

- [x] Task 1: Create feed router endpoint (AC: #5)
  - [x] Subtask 1.1: Implement `GET /api/feed` in `app/routers/feed.py`
  - [x] Subtask 1.2: Return all published clips with artist name, avatar, track info

- [x] Task 2: Create TrackGallery component (AC: #1, #2, #4)
  - [x] Subtask 2.1: Create `TrackGallery.tsx` in `features/studio/`
  - [x] Subtask 2.2: 2-column grid layout
  - [x] Subtask 2.3: Glass morphism track cards with waveform visual
  - [x] Subtask 2.4: Track name, duration, influence badge
  - [x] Subtask 2.5: Sort by most recent first

- [x] Task 3: Track card interaction (AC: #3)
  - [x] Subtask 3.1: Audio playback on card click
  - [x] Subtask 3.2: Play/pause state management

- [x] Task 4: Integrate into ArtistProfile (AC: #1)
  - [x] Subtask 4.1: Replace "No tracks published" placeholder with TrackGallery
  - [x] Subtask 4.2: Pass artist tracks to TrackGallery

---

## Dev Notes

### Track Gallery Design

The gallery uses a 2-column CSS grid with glass morphism cards. Each card has a simulated waveform (generated from track metadata), track name, duration, and an influence badge. Cards are clickable to toggle audio playback.

### Feed Endpoint

The `GET /api/feed` endpoint aggregates clips from storage, joins with artist and track data, and returns enriched feed items sorted by creation date (newest first).

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### File List

- `backend/app/routers/feed.py`
- `frontend/src/features/studio/TrackGallery.tsx`
- `frontend/src/features/studio/ArtistProfile.tsx`
- `frontend/src/features/studio/ClipGenerator.tsx`
- `frontend/src/api/video.ts`
