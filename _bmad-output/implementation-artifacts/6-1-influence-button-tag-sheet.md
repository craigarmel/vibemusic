# Story 6.1: Influence Button & Tag Sheet

Status: review

---

## Story

As a **fan**,
I want to tap an influence button on a feed clip and select a tag from a bottom sheet,
So that I can steer the artist's next sound direction.

---

## Acceptance Criteria

1. **AC1: Influence Button in FeedCard**
   - Given a clip is visible in the feed
   - When the fan views the FeedCard right-side actions
   - Then an InfluenceButton is displayed — larger than other action buttons, pink/magenta gradient with glow, lightning bolt icon

2. **AC2: Tag Sheet Appearance**
   - Given the fan taps the InfluenceButton
   - When the TagSheet opens
   - Then a bottom sheet (~40% height) appears with glass morphism styling, backdrop blur, rounded-t-2xl
   - And a grid of 9 influence tags is displayed in 3 columns

3. **AC3: Tag Visual States**
   - Given the TagSheet is open
   - When a tag is unselected it appears as a glass pill with cyan border
   - When a tag is selected it shows a gradient fill
   - When a tag is trending it has a pink border

4. **AC4: Backend Endpoint**
   - Given the fan selects a tag
   - When the influence is submitted
   - Then `POST /api/feed/influence` is called with `{ artist_id, clip_id, tag }`

---

## Tasks / Subtasks

- [x] Task 1: Create InfluenceButton component (AC: #1)
  - [x] Subtask 1.1: Implement pink/magenta gradient button with glow effect
  - [x] Subtask 1.2: Add lightning bolt SVG icon
  - [x] Subtask 1.3: Add pulse animation for attention

- [x] Task 2: Create TagSheet bottom sheet component (AC: #2, #3)
  - [x] Subtask 2.1: Implement bottom sheet with glass morphism and backdrop blur
  - [x] Subtask 2.2: Create 3-column tag grid with all 9 tags
  - [x] Subtask 2.3: Implement tag visual states (default, selected, trending)
  - [x] Subtask 2.4: Add slide-up animation for sheet entry

- [x] Task 3: Create FeedCard component with InfluenceButton (AC: #1)
  - [x] Subtask 3.1: Build FeedCard with mock video/clip display
  - [x] Subtask 3.2: Add right-side action buttons including InfluenceButton
  - [x] Subtask 3.3: Wire tag selection to influence state

- [x] Task 4: Build full FeedView with FeedCard list (AC: #1)
  - [x] Subtask 4.1: Replace placeholder FeedView with working TikTok-style vertical scroll
  - [x] Subtask 4.2: Add mock feed data for demo

- [x] Task 5: Backend POST /api/feed/influence endpoint (AC: #4)
  - [x] Subtask 5.1: Create InfluenceRequest Pydantic model
  - [x] Subtask 5.2: Implement endpoint in feed.py router
  - [x] Subtask 5.3: Add GET /api/feed endpoint with mock data

- [x] Task 6: Frontend API layer (AC: #4)
  - [x] Subtask 6.1: Create src/api/feed.ts with submitInfluence and getFeed functions
  - [x] Subtask 6.2: Update useFeedStore with influence actions

---

## Dev Notes

### Influence Tags

```
"Plus sombre", "Plus de basses", "Plus rapide", "Electro vibes",
"Ambient", "Voix douce", "Hardcore", "Melodique", "Experimental"
```

### Tag Sheet Styling

- Height: ~40% viewport
- Glass morphism: backdrop-blur, semi-transparent bg
- Border radius: rounded-t-2xl
- Tag pills: glass bg with cyan border (default), gradient fill (selected), pink border (trending)

---

## Technical Requirements

### Project Structure

**Frontend:**
- `frontend/src/features/feed/InfluenceButton.tsx`
- `frontend/src/features/feed/TagSheet.tsx`
- `frontend/src/features/feed/FeedCard.tsx`
- `frontend/src/features/feed/FeedView.tsx` (updated)
- `frontend/src/api/feed.ts`
- `frontend/src/stores/useFeedStore.ts` (updated)
- `frontend/src/types/feed.ts` (updated)

**Backend:**
- `backend/app/routers/feed.py` (updated)
- `backend/app/models/feed.py` (new)

---

## File List

- `frontend/src/features/feed/InfluenceButton.tsx`
- `frontend/src/features/feed/TagSheet.tsx`
- `frontend/src/features/feed/FeedCard.tsx`
- `frontend/src/features/feed/FeedView.tsx`
- `frontend/src/api/feed.ts`
- `frontend/src/stores/useFeedStore.ts`
- `frontend/src/types/feed.ts`
- `backend/app/routers/feed.py`
- `backend/app/models/feed.py`
