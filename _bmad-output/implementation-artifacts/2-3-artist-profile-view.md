# Story 2.3: Artist Profile View

Status: review

## Story

As an **artist/label A&R**,
I want to see my artist's complete profile with lore and avatar,
so that I can review the identity before starting a session.

## Acceptance Criteria

1. **Given** an artist has lore and avatar generated
   **When** I view the Studio Dashboard
   **Then** the `ArtistProfile` component displays: avatar (200px circle, neon border glow), artist name large, genre tags (cyan pills), biography text, personality traits

2. **Given** the profile is visible
   **When** I look at the stats row
   **Then** I see 3 glass morphism stat cards: "Sessions: 0", "Tracks: 0", "Fan Influences: 0" with icons and cyan accent numbers

3. **Given** the profile is visible
   **When** I look at the CTA area
   **Then** a "Start New Session" button is visible (gradient cyan-to-purple, neon glow)
   **And** clicking it navigates to the live session view (placeholder for now — Epic 3)

4. **Given** the sidebar exists
   **When** I click "Home" in the sidebar
   **Then** the Artist Profile view is shown (instead of the Studio creator view)
   **And** the sidebar has nav items: Home (active), Sessions, Tracks, Influences, Settings matching the profile-screen.png mockup

## Tasks / Subtasks

- [x] Task 1: Create ArtistProfile component (AC: #1, #2, #3)
  - [x] 1.1: Create `frontend/src/features/studio/ArtistProfile.tsx` with full profile layout matching `profile-screen.png` Stitch mockup
  - [x] 1.2: Hero section: large avatar (200px circle, animated neon border glow with pulse-glow keyframe), artist name large, genre tags as cyan pills, bio text centered
  - [x] 1.3: Stats row: 3 glass morphism StatCard components — Sessions, Tracks, Fan Influences with icons and cyan mono numbers
  - [x] 1.4: "Start New Session" CTA button: btn-primary with play icon
  - [x] 1.5: "Published Tracks" section with placeholder message
- [x] Task 2: Add GET /api/artists/{id} backend endpoint (AC: #1)
  - [x] 2.1: Add `GET /api/artists/{artist_id}` to `app/routers/artist.py` — returns artist_id, prompt, lore, avatar_url
  - [x] 2.2: Add `getArtist(artistId: string)` to `frontend/src/api/artist.ts`
- [x] Task 3: Update sidebar navigation (AC: #4)
  - [x] 3.1: Two nav item sets: `creatorNavItems` (Studio, Library, Analytics, Settings) and `profileNavItems` (Home, Sessions, Tracks, Influences, Settings)
  - [x] 3.2: StudioDashboard dynamically switches nav items based on whether artist exists
  - [x] 3.3: Auto-switches to "home" (profile) view when artist is created via useEffect
- [x] Task 4: Wire it all together (AC: #1, #4)
  - [x] 4.1: renderContent() switch statement: 'home' → ArtistProfile, 'studio' → LoreGenerator+AvatarGenerator, default → Coming soon
  - [x] 4.2: "Edit Artist" button in sidebar (dashed magenta border) to switch back to studio view

## Dev Notes

### Architecture Compliance

- ArtistProfile is a feature component in `src/features/studio/`
- Reads from `useStudioStore` — no local state for artist data
- Backend endpoint follows same response wrapper pattern
- Navigation state managed in StudioDashboard local state (sidebar active item)

### Visual Reference (Stitch profile-screen.png)

The profile mockup shows:
- **Left sidebar** (~200px): "Synthetica / ARTIST PORTAL" branding, nav items with icons: Home (active, cyan), Sessions, Tracks, Influences, Settings. Bottom: user avatar + "Status: Active"
- **Main content**:
  - Centered avatar (large circle, neon glow border)
  - Artist name "Sapphir Λ" large below avatar
  - Genre tags: "TECHNO" "DARK AMBIENT" as small cyan pills
  - Bio text in muted gray, centered
  - "Start New Session" button: dark bg, cyan border, with play icon
  - Stats row: 3 cards — Sessions: 12, Tracks: 42, Fan Influences: 847
  - "Published Tracks" section: grid of 4 track cards with cover art, track name, small waveform, influence badge

### Previous Story Intelligence

- `StudioDashboard.tsx` already has sidebar with SVG icon nav items — extend, don't replace
- `useStudioStore` already has `artist: ArtistData` with `lore` and `avatar_url` — read from it
- `AvatarGenerator.tsx` already displays the avatar in a circle — reuse the neon border styling pattern
- API client `client.ts` and `artist.ts` already exist — add `getArtist()` function
- Glass morphism `.glass` class and `.neon-border` class already exist in `index.css`
- `.btn-primary` class (cyan-to-purple gradient) already exists

### File Structure

```
backend/app/
└── routers/
    └── artist.py          # Add GET /api/artists/{artist_id}

frontend/src/
├── api/
│   └── artist.ts          # Add getArtist()
└── features/studio/
    ├── StudioDashboard.tsx # Update sidebar nav logic
    └── ArtistProfile.tsx   # NEW: full profile view
```

### Testing Requirements

- Backend: Test `GET /api/artists/{id}` returns correct data, 404 for unknown id
- Frontend: Test ArtistProfile renders avatar, name, stats, CTA when artist data exists
- Test sidebar navigation switches between home/studio views

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#B2B Components — ArtistProfile]
- [Source: public/templates/profile-screen.png — Stitch mockup for exact layout]
- [Source: _bmad-output/implementation-artifacts/2-1-lore-generation-gemini.md — Previous story patterns]
- [Source: _bmad-output/implementation-artifacts/2-2-avatar-generation-nano-banana.md — Avatar display patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

### Completion Notes List

- ArtistProfile: hero with pulsing neon avatar glow (CSS keyframe), name, trait pills, bio, CTA
- StatCard sub-component: reusable glass morphism card with icon, label, value, subtitle
- GET /api/artists/{id}: returns full artist data, 404 if not found
- Dynamic sidebar: switches between creator nav and profile nav based on artist existence
- useEffect auto-transitions to profile view on artist creation
- "Edit Artist" dashed magenta button in sidebar for switching back to studio

### File List

- frontend/src/features/studio/ArtistProfile.tsx (new)
- frontend/src/features/studio/StudioDashboard.tsx (rewritten — dynamic nav, renderContent switch)
- frontend/src/api/artist.ts (modified — added getArtist)
- backend/app/routers/artist.py (modified — added GET /api/artists/{id})
