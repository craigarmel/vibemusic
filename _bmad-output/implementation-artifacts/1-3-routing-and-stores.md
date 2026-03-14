# Story 1.3: Configure Routing and Zustand Stores

Status: done

## Story

As a **developer**,
I want React Router and Zustand stores configured,
so that the B2B and B2C views are accessible and state management is ready.

## Acceptance Criteria

1. **Given** the design system is implemented
   **When** I navigate to `/studio`
   **Then** the B2B Studio Dashboard shell loads inside the Layout
   **And** the left sidebar shows nav items: Studio, Library, Analytics, Settings (per Stitch mockup)

2. **Given** routing is configured
   **When** I navigate to `/feed`
   **Then** the B2C Fan Feed shell loads (full-screen, no sidebar)

3. **Given** the stores are initialized
   **When** I inspect `useStudioStore`
   **Then** it has initial state: `artist` (null), loading flags (`is_generating_lore`, `is_generating_image`, `is_generating_audio`, `is_generating_video` all false), `error` (null)

4. **Given** the stores are initialized
   **When** I inspect `useFeedStore`
   **Then** it has initial state: `feed_items` (empty array), `is_loading` (false), `influence_state` (null)

5. **Given** I navigate to the root `/`
   **When** the page loads
   **Then** I am redirected to `/studio` (B2B is the default view for hackathon demo)

## Tasks / Subtasks

- [x] Task 1: Install dependencies (AC: #1, #2, #3, #4)
  - [x] 1.1: `cd frontend && npm install react-router-dom zustand`
- [x] Task 2: Configure routing (AC: #1, #2, #5)
  - [x] 2.1: Update `App.tsx` with `BrowserRouter`, `Routes`, `Route` for `/studio` and `/feed`
  - [x] 2.2: Add redirect from `/` to `/studio`
  - [x] 2.3: Create `frontend/src/features/studio/StudioDashboard.tsx` — shell with left sidebar nav (Studio, Library, Analytics, Settings icons per dashboard-screen.png mockup) + main content area placeholder
  - [x] 2.4: Create `frontend/src/features/feed/FeedView.tsx` — full-screen shell placeholder, no sidebar
- [x] Task 3: Create Zustand stores (AC: #3, #4)
  - [x] 3.1: Create `frontend/src/stores/useStudioStore.ts` with state: `artist: ArtistData | null`, `is_generating_lore: boolean`, `is_generating_image: boolean`, `is_generating_audio: boolean`, `is_generating_video: boolean`, `error: string | null` and corresponding setters
  - [x] 3.2: Create `frontend/src/stores/useFeedStore.ts` with state: `feed_items: FeedItem[]`, `is_loading: boolean`, `influence_state: InfluenceState | null` and corresponding setters
  - [x] 3.3: Create `frontend/src/types/artist.ts` with `ArtistData`, `LoreData` types
  - [x] 3.4: Create `frontend/src/types/feed.ts` with `FeedItem`, `InfluenceState`, `InfluenceTag` types

## Dev Notes

### Architecture Compliance

- Routing: React Router v7 with `BrowserRouter`
- State: Zustand stores — one per domain (studio, feed)
- Stores are the single source of truth — components read from stores, API calls write to stores
- Feature folders: `src/features/studio/` and `src/features/feed/`

### Sidebar Layout (from Stitch dashboard-screen.png)

The B2B sidebar from the mockup shows:
- "Synthetica" brand name + "ARTIST PORTAL" subtitle at top
- Nav items with icons: Studio (active, cyan highlight), Library, Analytics, Settings
- Bottom: User avatar + name + "UPGRADE PLAN" button
- Width: ~200px, dark background, left-aligned

For hackathon: implement the sidebar structure with nav items but only Studio route is functional. Others show "Coming soon" placeholder.

### Zustand Store Pattern

```typescript
import { create } from 'zustand'

interface StudioState {
  artist: ArtistData | null
  is_generating_lore: boolean
  // ... other flags
  setArtist: (artist: ArtistData) => void
  setGeneratingLore: (val: boolean) => void
  // ... other setters
}

export const useStudioStore = create<StudioState>((set) => ({
  artist: null,
  is_generating_lore: false,
  // ... initial state
  setArtist: (artist) => set({ artist }),
  setGeneratingLore: (val) => set({ is_generating_lore: val }),
}))
```

### Type Definitions

```typescript
// types/artist.ts
export interface LoreData {
  name: string
  biography: string
  personality_traits: string[]
  lyrics: string
}

export interface ArtistData {
  artist_id: string
  prompt: string
  lore: LoreData | null
  avatar_url: string | null
}
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: public/templates/dashboard-screen.png — Sidebar layout reference]
- [Source: public/templates/profile-screen.png — Profile sidebar reference]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

### Completion Notes List

- Installed react-router-dom v7.13.1 and zustand v5.0.11
- App.tsx configured with BrowserRouter: / redirects to /studio, /studio renders StudioDashboard, /feed renders FeedView
- StudioDashboard has left sidebar (w-56) with nav items (Studio, Library, Analytics, Settings) + main content area placeholder
- FeedView is a full-screen black shell placeholder, no sidebar
- useStudioStore has artist, 4 generating flags, error, setters, updateArtist, reset
- useFeedStore has feed_items, is_loading, influence_state, error, setters
- TypeScript types defined: ArtistData, LoreData, FeedItem, InfluenceTag, InfluenceState

### File List

- frontend/package.json (modified — added react-router-dom, zustand)
- frontend/package-lock.json (modified)
- frontend/src/App.tsx (modified — BrowserRouter routing)
- frontend/src/features/studio/StudioDashboard.tsx (new)
- frontend/src/features/feed/FeedView.tsx (new)
- frontend/src/stores/useStudioStore.ts (new)
- frontend/src/stores/useFeedStore.ts (new)
- frontend/src/types/artist.ts (new)
- frontend/src/types/feed.ts (new)
