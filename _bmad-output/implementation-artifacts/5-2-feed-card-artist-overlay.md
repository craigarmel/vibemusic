# Story 5.2: Feed Card with Artist Overlay

Status: review

## Story

As a **fan**,
I want to see who created each clip and basic track info,
So that I can learn about the virtual artist.

## Acceptance Criteria

1. **Given** a clip is playing in the feed
   **When** I look at the `FeedCard` component
   **Then** a bottom overlay (gradient transparent to black) shows: artist avatar (small circle, neon border), artist name in white bold, track title in white, duration in gray

2. **Given** the feed card is visible
   **When** I look at the right side
   **Then** floating action buttons are visible: heart icon with count, share icon

3. **Given** the feed card shows artist info
   **When** I tap on the artist name/avatar
   **Then** it could navigate to the artist profile (mock link for hackathon)

## Tasks / Subtasks

- [x] Task 1: FeedCard component — video + overlay (AC: #1, #2, #3)
  - [x] 1.1: Create `FeedCard.tsx` with full-screen video element
  - [x] 1.2: Add bottom gradient overlay with artist avatar (circle, neon border), name, track title, duration
  - [x] 1.3: Add right-side floating action buttons (heart with count, share icon)
  - [x] 1.4: Make artist name/avatar tappable (mock navigation for hackathon)
  - [x] 1.5: Follow neon design system (dark bg, cyan/magenta accents, glass morphism)

## Dev Notes

### Architecture Compliance

- `FeedCard.tsx` lives in `frontend/src/features/feed/`
- Receives `FeedItem` type from `types/feed.ts`
- Uses neon design system colors and glass morphism utilities
- Component is pure presentation — all state managed by parent `FeedView`

### Technical Requirements

- Bottom overlay: `background: linear-gradient(transparent, rgba(0,0,0,0.9))`
- Artist avatar: 40px circle with neon cyan border
- Action buttons: semi-transparent glass background, white icons
- Heart button tracks like count from FeedItem data
- SVG icons for heart and share (inline, no icon library)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Boundaries]
