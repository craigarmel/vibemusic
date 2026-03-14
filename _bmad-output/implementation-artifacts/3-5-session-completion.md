# Story 3.5: Session Completion & Track Publication

Status: review

---

## Story

As an **artist**,
I want the session to produce a final consolidated track that auto-publishes,
So that fans can discover my creation in the feed.

---

## Acceptance Criteria

1. **AC1: Session Completion Trigger**
   - Given a live session is active
   - When I click "End Session"
   - Then the WebSocket connection closes and Lyria generates a final consolidated audio track

2. **AC2: Session Complete Component**
   - Given the session has ended
   - When the final track is being generated
   - Then the `SessionComplete` component appears: centered glass morphism card with checkmark icon

3. **AC3: Final Track Display**
   - Given the SessionComplete component is visible
   - When the track is ready
   - Then the final track waveform is displayed (static, cyan/purple gradient)
   - And track details show: track ID, duration, generation timestamp in monospace text
   - And a play button allows previewing the final track

4. **AC4: Fan Influences Applied**
   - Given fan influences were received during the session
   - When viewing the SessionComplete component
   - Then the "Fan Influences Applied" section shows tag pills used during the session

5. **AC5: Publication Options**
   - Given the final track is ready
   - When I review the track
   - Then "Publish to Artist Space" CTA button triggers `POST /api/clips` saving the track
   - And "Save as Draft" secondary link saves without publishing
   - And after publishing, the track appears in the artist's `TrackGallery`

6. **AC6: Lyria Final Track Generation**
   - Given the session is ending
   - When the backend processes the completion
   - Then the backend calls Lyria to consolidate all audio chunks into a final track
   - And the track is saved to `media/audio/{track_id}.wav`
   - And the track metadata is stored in `storage.py`

---

## Tasks / Subtasks

- [ ] Task 1: Create SessionComplete component (AC: #2)
  - [ ] Subtask 1.1: Create `SessionComplete.tsx` component
  - [ ] Subtask 1.2: Design centered glass morphism card layout
  - [ ] Subtask 1.3: Add animated checkmark icon
  - [ ] Subtask 1.4: Implement loading state while track generates

- [ ] Task 2: Implement final track waveform display (AC: #3)
  - [ ] Subtask 2.1: Create `StaticWaveform.tsx` component
  - [ ] Subtask 2.2: Generate waveform visualization from audio file
  - [ ] Subtask 2.3: Style with cyan/purple gradient
  - [ ] Subtask 2.4: Add play/pause button for preview

- [ ] Task 3: Display track metadata (AC: #3)
  - [ ] Subtask 3.1: Show track ID (shortened UUID)
  - [ ] Subtask 3.2: Display duration in MM:SS format
  - [ ] Subtask 3.3: Show generation timestamp
  - [ ] Subtask 3.4: Use monospace font styling

- [ ] Task 4: Show applied fan influences (AC: #4)
  - [ ] Subtask 4.1: Aggregate fan influence tags from session
  - [ ] Subtask 4.2: Display tags as glass morphism pills
  - [ ] Subtask 4.3: Sort by frequency (most used first)
  - [ ] Subtask 4.4: Show "Fan Influences Applied" section title

- [ ] Task 5: Implement publication actions (AC: #5)
  - [ ] Subtask 5.1: Create "Publish to Artist Space" primary CTA button
  - [ ] Subtask 5.2: Create "Save as Draft" secondary button
  - [ ] Subtask 5.3: Call `POST /api/clips` endpoint
  - [ ] Subtask 5.4: Handle success/error states
  - [ ] Subtask 5.5: Navigate to TrackGallery on success

- [ ] Task 6: Backend final track generation (AC: #6)
  - [ ] Subtask 6.1: Handle session end in WebSocket
  - [ ] Subtask 6.2: Call Lyria to consolidate audio chunks
  - [ ] Subtask 6.3: Save final audio file to `media/audio/`
  - [ ] Subtask 6.4: Create track metadata record
  - [ ] Subtask 6.5: Implement `POST /api/clips` endpoint
  - [ ] Subtask 6.6: Update storage with published track

---

## Dev Notes

### Session Complete Component Layout

```tsx
// features/studio/SessionComplete.tsx
import { useState, useEffect } from 'react';
import { CheckCircle2, Play, Pause } from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { StaticWaveform } from '../../components/StaticWaveform';
import { api } from '../../api/client';

export const SessionComplete: React.FC = () => {
  const { currentTrack, session_influences, artist } = useStudioStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await api.post('/clips', {
        track_id: currentTrack?.id,
        artist_id: artist?.id,
        status: 'published'
      });
      // Navigate to TrackGallery
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="w-full max-w-md mx-4">
        {/* Glass morphism card */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.5)]">
              <CheckCircle2 size={40} className="text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-white mb-2">
            Session Complete!
          </h2>
          <p className="text-white/60 text-center mb-6">
            Your track has been generated
          </p>

          {/* Track info */}
          {currentTrack && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <div className="text-right font-mono text-sm text-white/60">
                  <div>{currentTrack.id.slice(0, 8)}...</div>
                  <div>{formatDuration(currentTrack.duration)}</div>
                </div>
              </div>

              {/* Waveform */}
              <StaticWaveform audioUrl={currentTrack.audio_url} />
            </div>
          )}

          {/* Fan influences */}
          {session_influences.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white/80 mb-3">
                Fan Influences Applied
              </h3>
              <div className="flex flex-wrap gap-2">
                {aggregateInfluences(session_influences).map(({ tag, count }) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs backdrop-blur-md bg-white/10 border border-cyan-400/30 text-cyan-400"
                  >
                    {tag} {count > 1 && `(${count})`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPublishing ? 'Publishing...' : 'Publish to Artist Space'}
            </button>

            <button
              onClick={handleSaveDraft}
              className="w-full py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Static Waveform Component

```tsx
// components/StaticWaveform.tsx
import { useEffect, useRef, useState } from 'react';

interface StaticWaveformProps {
  audioUrl: string;
}

export const StaticWaveform: React.FC<StaticWaveformProps> = ({ audioUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    // Load audio and generate waveform data
    const generateWaveform = async () => {
      const audioContext = new AudioContext();
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Get audio data (use left channel)
      const channelData = audioBuffer.getChannelData(0);
      const samples = 100; // Number of bars
      const blockSize = Math.floor(channelData.length / samples);
      const filteredData = [];

      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j]);
        }
        filteredData.push(sum / blockSize);
      }

      // Normalize to 0-1
      const max = Math.max(...filteredData);
      const normalizedData = filteredData.map(v => v / max);

      setWaveformData(normalizedData);
    };

    generateWaveform();
  }, [audioUrl]);

  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const barWidth = canvas.width / waveformData.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    waveformData.forEach((value, i) => {
      const barHeight = value * canvas.height;
      const x = i * barWidth;
      const y = (canvas.height - barHeight) / 2;

      // Gradient
      const gradient = ctx.createLinearGradient(0, y + barHeight, 0, y);
      gradient.addColorStop(0, '#00f0ff');
      gradient.addColorStop(1, '#8b5cf6');

      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    });
  }, [waveformData]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={60}
      className="w-full h-16 rounded-lg bg-black/30"
    />
  );
};
```

### Backend Final Track Generation

```python
# services/lyria.py
import asyncio
from google import genai
from google.genai import types

async def generate_final_track(session_id: str, audio_chunks: list) -> str:
    """
    Consolidate audio chunks into final track using Lyria.
    For hackathon: concatenate chunks and save as WAV.
    """
    # Combine all audio chunks
    combined_audio = b''.join(audio_chunks)

    # Save to file
    track_id = generate_uuid()
    audio_path = f"media/audio/{track_id}.wav"

    # Write WAV header + PCM data
    write_wav_file(audio_path, combined_audio, sample_rate=48000, channels=2)

    return track_id, audio_path

def write_wav_file(path: str, pcm_data: bytes, sample_rate: int, channels: int):
    """Write PCM data to WAV file with proper header."""
    import wave
    import struct

    with wave.open(path, 'wb') as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_data)
```

### WebSocket End Session Handler

```python
# routers/audio.py
from fastapi import WebSocket, WebSocketDisconnect

@router.websocket("/audio/stream")
async def audio_stream(websocket: WebSocket):
    await websocket.accept()
    session_id = None
    audio_chunks = []

    try:
        async with client.aio.live.music.connect(model='models/lyria-realtime-exp') as lyria_session:
            async def receive_from_client():
                nonlocal session_id
                while True:
                    data = await websocket.receive_json()

                    if data["type"] == "session_init":
                        session_id = data["session_id"]
                    elif data["type"] == "end_session":
                        # Generate final track
                        track_id, audio_path = await generate_final_track(
                            session_id, audio_chunks
                        )
                        await websocket.send_json({
                            "type": "session_complete",
                            "track_id": track_id,
                            "audio_url": f"/media/audio/{track_id}.wav"
                        })
                        break
                    elif data["type"] == "music_generation_config":
                        await lyria_session.set_music_generation_config(...)

            async def send_to_client():
                async for message in lyria_session.receive():
                    if message.server_content.audio_chunks:
                        audio_data = message.server_content.audio_chunks[0].data
                        audio_chunks.append(audio_data)
                        await websocket.send_bytes(audio_data)

            await asyncio.gather(receive_from_client(), send_to_client())

    except WebSocketDisconnect:
        print(f"Client disconnected from session {session_id}")
```

### POST /api/clips Endpoint

```python
# routers/video.py
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class ClipCreateRequest(BaseModel):
    track_id: str
    artist_id: str
    status: str  # "published" or "draft"

class ClipResponse(BaseModel):
    clip_id: str
    track_id: str
    artist_id: str
    status: str
    created_at: datetime

@router.post("/clips")
async def create_clip(request: ClipCreateRequest):
    clip_id = generate_uuid()

    clip = {
        "clip_id": clip_id,
        "track_id": request.track_id,
        "artist_id": request.artist_id,
        "status": request.status,
        "created_at": datetime.now(),
        "video_url": None  # Will be set after Veo generation in Epic 4
    }

    storage.clips[clip_id] = clip

    # Update artist track count
    if request.artist_id in storage.artists:
        storage.artists[request.artist_id]["track_count"] += 1

    return {
        "status": "success",
        "data": clip
    }
```

### Aggregating Fan Influences

```typescript
// utils/influences.ts
interface Influence {
  tag: string;
  timestamp: number;
}

interface AggregatedInfluence {
  tag: string;
  count: number;
}

export const aggregateInfluences = (
  influences: Influence[]
): AggregatedInfluence[] => {
  const counts = new Map<string, number>();

  influences.forEach(({ tag }) => {
    counts.set(tag, (counts.get(tag) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
};
```

### Storage Updates

```python
# storage.py
# Add to storage structure
storage.clips = {}  # clip_id -> clip_data
storage.tracks = {}  # track_id -> track_data
storage.influences = []  # List of influence entries

# Influence entry structure
{
    "influence_id": str,
    "artist_id": str,
    "clip_id": str,  # or session_id
    "tag": str,
    "timestamp": datetime
}
```

---

## Technical Requirements

### Project Structure

**Frontend:**
- `frontend/src/features/studio/SessionComplete.tsx` - Session completion view
- `frontend/src/components/StaticWaveform.tsx` - Waveform visualization
- `frontend/src/utils/influences.ts` - Influence aggregation utilities

**Backend:**
- `backend/app/services/lyria.py` - Update with final track generation
- `backend/app/routers/video.py` - Create clips endpoint
- `backend/app/models/video.py` - Clip request/response models

### Dependencies

**Backend:**
- `wave` module (built-in) for WAV file writing

### Audio File Format

- **Format:** WAV
- **Sample Rate:** 48kHz
- **Channels:** 2 (stereo)
- **Bit Depth:** 16-bit PCM
- **Location:** `backend/media/audio/{track_id}.wav`

---

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.5]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR5: SessionComplete]
- Lyria API: https://ai.google.dev/api/live_music
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

- `frontend/src/features/studio/SessionComplete.tsx`
- `frontend/src/components/StaticWaveform.tsx`
- `frontend/src/utils/influences.ts`
- `backend/app/services/lyria.py`
- `backend/app/routers/video.py`
- `backend/app/models/video.py`
