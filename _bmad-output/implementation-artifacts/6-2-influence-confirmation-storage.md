# Story 6.2: Influence Confirmation & Storage

Status: review

---

## Story

As a **fan**,
I want to see a confirmation after submitting my influence tag,
So that I know my feedback was received by the artist.

---

## Acceptance Criteria

1. **AC1: Confirmation Toast**
   - Given the fan has selected and submitted a tag
   - When the influence is successfully stored
   - Then a ConfirmToast appears with "Ton influence a ete prise en compte"
   - And the toast auto-dismisses after 3 seconds

2. **AC2: Backend Storage**
   - Given an influence is submitted via POST /api/feed/influence
   - When the backend processes it
   - Then the influence is stored in storage.py influences list with artist_id, clip_id, tag, and timestamp

3. **AC3: Tag Sheet Dismissal**
   - Given the influence was submitted
   - When the confirmation toast appears
   - Then the TagSheet closes and the selected tag resets

---

## Tasks / Subtasks

- [x] Task 1: Wire confirmation toast after influence submission (AC: #1)
  - [x] Subtask 1.1: Show Toast with success message on successful POST
  - [x] Subtask 1.2: Auto-dismiss after 3 seconds using existing Toast component

- [x] Task 2: Backend stores influence data (AC: #2)
  - [x] Subtask 2.1: Append influence record to storage.influences list
  - [x] Subtask 2.2: Include timestamp in stored record

- [x] Task 3: Tag sheet closes after submission (AC: #3)
  - [x] Subtask 3.1: Reset influence_state in useFeedStore after successful submission
  - [x] Subtask 3.2: Close TagSheet and clear selected tag

---

## Technical Requirements

### Toast Usage

Uses existing `Toast.tsx` component at `src/components/Toast.tsx`.

### Storage Record Shape

```python
{
    "artist_id": str,
    "clip_id": str,
    "tag": str,
    "created_at": datetime
}
```

---

## File List

- `frontend/src/features/feed/FeedCard.tsx` (toast integration)
- `frontend/src/features/feed/TagSheet.tsx` (dismiss on submit)
- `backend/app/routers/feed.py` (storage logic)
- `backend/app/storage.py` (already has influences list)
