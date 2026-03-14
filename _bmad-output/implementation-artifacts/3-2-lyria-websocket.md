# Story 3.2: Lyria RealTime WebSocket Audio Streaming

Status: ready-for-dev

---

## Story

As an **artist**,
I want Lyria to capture my live ambiance and generate reactive music in real-time,
So that the music evolves as I perform.

---

## Acceptance Criteria

1. **AC1: WebSocket Connection Setup**
   - Given a live session is active with camera/mic enabled
   - When the session starts
   - Then the frontend opens a WebSocket connection to `/api/audio/stream`

2. **AC2: Audio Input Capture**
   - Given the WebSocket is connected
   - When the session is active
   - Then the browser's audio input (microphone) is captured and sent to the backend via WebSocket

3. **AC3: Lyria RealTime Integration**
   - Given audio input is being received
   - When the backend processes the stream
   - Then the backend `lyria.py` service processes the audio input through Lyria RealTime API
   - And generated audio chunks are streamed back to the frontend via WebSocket

4. **AC4: Real-time Audio Playback**
   - Given audio chunks are being received
   - When the frontend receives chunks
   - Then the audio plays in real-time through the browser's audio output
   - And audio buffering is implemented (2-3 chunks) to handle network jitter

5. **AC5: WebSocket Hook Management**
   - Given the WebSocket is active
   - When the session lifecycle changes
   - Then the `useLyriaStream.ts` hook manages the WebSocket lifecycle (connect, send params, receive audio, disconnect)

---

## Tasks / Subtasks

- [ ] Task 1: Create Lyria RealTime service backend (AC: #3)
  - [ ] Subtask 1.1: Install `google-genai>=1.52.0` package
  - [ ] Subtask 1.2: Create `lyria.py` service with async connection handler
  - [ ] Subtask 1.3: Implement Lyria WebSocket connection to `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateMusic`
  - [ ] Subtask 1.4: Handle initial setup message with model configuration

- [ ] Task 2: Create WebSocket endpoint in FastAPI (AC: #1)
  - [ ] Subtask 2.1: Add WebSocket endpoint `/api/audio/stream` in `audio.py` router
  - [ ] Subtask 2.2: Handle client connection and session validation
  - [ ] Subtask 2.3: Bridge frontend WebSocket to Lyria RealTime service
  - [ ] Subtask 2.4: Handle disconnect and cleanup

- [ ] Task 3: Create useLyriaStream hook (AC: #5)
  - [ ] Subtask 3.1: Create `useLyriaStream.ts` hook with WebSocket client
  - [ ] Subtask 3.2: Implement connection management (connect, disconnect)
  - [ ] Subtask 3.3: Implement audio parameter sending (BPM, intensity, prompts)
  - [ ] Subtask 3.4: Implement audio chunk receiving and buffering

- [ ] Task 4: Implement browser audio playback (AC: #2, #4)
  - [ ] Subtask 4.1: Set up AudioContext with 48kHz sample rate
  - [ ] Subtask 4.2: Create audio buffer queue for incoming chunks
  - [ ] Subtask 4.3: Implement smooth playback with ScriptProcessorNode or AudioWorklet
  - [ ] Subtask 4.4: Handle audio format conversion (16-bit PCM to Float32)

- [ ] Task 5: Audio parameter controls integration (AC: #3)
  - [ ] Subtask 5.1: Send initial music generation config (BPM, guidance, density)
  - [ ] Subtask 5.2: Implement real-time parameter updates via WebSocket
  - [ ] Subtask 5.3: Handle weighted prompts for music steering

---

## Dev Notes

### Lyria RealTime API Documentation

**WebSocket Endpoint:**
```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateMusic
```

**Model:**
```
models/lyria-realtime-exp
```

**Python SDK Setup:**
```python
pip install "google-genai>=1.52.0"
```

**Lyria RealTime Connection (Python Backend):**
```python
from google import genai
from google.genai import types

client = genai.Client(http_options={'api_version': 'v1alpha'})

async with client.aio.live.music.connect(model='models/lyria-realtime-exp') as session:
    # Send initial prompts and config
    await session.set_weighted_prompts(
        prompts=[
            types.WeightedPrompt(text='minimal techno', weight=1.0),
        ]
    )
    await session.set_music_generation_config(
        config=types.LiveMusicGenerationConfig(bpm=90, temperature=1.0)
    )

    # Receive audio chunks
    async for message in session.receive():
        audio_data = message.server_content.audio_chunks[0].data
        # Forward to frontend via WebSocket
```

**WebSocket Message Types:**
- `setup`: Session configuration (sent first)
- `client_content`: Weighted prompts as model input
- `music_generation_config`: Configuration for music generation
- `playback_control`: Commands (PLAY, PAUSE, STOP)

### Music Generation Parameters

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `guidance` | 0.0 - 6.0 | 4.0 | How strictly model follows prompts |
| `bpm` | 60 - 200 | - | Beats per minute |
| `temperature` | 0.0 - 3.0 | 1.1 | Creativity/randomness |
| `density` | - | - | Density of note onsets |
| `brightness` | - | - | Spectral brightness |

### Key Scales Available:
- C_MAJOR_A_MINOR
- D_FLAT_MAJOR_B_FLAT_MINOR
- D_MAJOR_B_MINOR
- E_FLAT_MAJOR_C_MINOR
- E_MAJOR_C_SHARP_MINOR
- F_MAJOR_D_MINOR
- G_FLAT_MAJOR_E_FLAT_MINOR
- G_MAJOR_E_MINOR

### Audio Format Specifications

- **Channels:** 2 (stereo)
- **Sample Rate:** 48kHz
- **Output Format:** Raw 16-bit PCM Audio
- **Chunk Duration:** ~2 seconds per chunk

### Frontend Audio Playback

```typescript
// Create AudioContext at 48kHz
const audioContext = new AudioContext({ sampleRate: 48000 });

// Convert 16-bit PCM to Float32
const pcm16ToFloat32 = (pcmData: ArrayBuffer): Float32Array => {
  const int16Array = new Int16Array(pcmData);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768;
  }
  return float32Array;
};

// Buffer and play audio chunks
const playChunk = async (audioData: ArrayBuffer) => {
  const floatData = pcm16ToFloat32(audioData);
  const audioBuffer = audioContext.createBuffer(2, floatData.length / 2, 48000);

  // Deinterleave stereo
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);
  for (let i = 0; i < floatData.length / 2; i++) {
    left[i] = floatData[i * 2];
    right[i] = floatData[i * 2 + 1];
  }

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
};
```

### WebSocket Hook Structure

```typescript
// hooks/useLyriaStream.ts
interface UseLyriaStreamReturn {
  isConnected: boolean;
  connect: (sessionId: string) => void;
  disconnect: () => void;
  sendParams: (params: AudioParams) => void;
  sendPrompts: (prompts: WeightedPrompt[]) => void;
  sendPlaybackControl: (control: 'PLAY' | 'PAUSE' | 'STOP') => void;
}

interface AudioParams {
  bpm?: number;
  guidance?: number;
  temperature?: number;
  density?: number;
  brightness?: number;
}

interface WeightedPrompt {
  text: string;
  weight: number;
}
```

### FastAPI WebSocket Bridge

```python
# routers/audio.py
from fastapi import WebSocket, WebSocketDisconnect

@router.websocket("/audio/stream")
async def audio_stream(websocket: WebSocket):
    await websocket.accept()

    try:
        # Connect to Lyria RealTime
        async with client.aio.live.music.connect(model='models/lyria-realtime-exp') as lyria_session:
            # Handle messages from frontend
            async def receive_from_client():
                while True:
                    data = await websocket.receive_json()
                    # Forward to Lyria
                    if data["type"] == "music_generation_config":
                        await lyria_session.set_music_generation_config(...)
                    elif data["type"] == "client_content":
                        await lyria_session.set_weighted_prompts(...)

            # Handle messages from Lyria
            async def send_to_client():
                async for message in lyria_session.receive():
                    if message.server_content.audio_chunks:
                        audio_data = message.server_content.audio_chunks[0].data
                        await websocket.send_bytes(audio_data)

            # Run both tasks concurrently
            await asyncio.gather(receive_from_client(), send_to_client())

    except WebSocketDisconnect:
        print("Client disconnected")
```

### Important Implementation Notes

1. **Settling Period:** Lyria needs 5-10 seconds to "settle" into a coherent style after starting or resetting context
2. **Audio Buffering:** Implement 2-3 chunk buffer on client side to handle network jitter
3. **Context Reset:** Use `playback_control: "STOP"` with context reset to start fresh
4. **Prompt Blending:** Multiple prompts can be mixed with weights for style morphing

---

## Technical Requirements

### Project Structure

**Frontend:**
- `frontend/src/hooks/useLyriaStream.ts` - Lyria WebSocket hook
- `frontend/src/api/audio.ts` - Audio API client functions
- `frontend/src/utils/audio.ts` - Audio format conversion utilities

**Backend:**
- `backend/app/services/lyria.py` - Lyria RealTime service
- `backend/app/routers/audio.py` - WebSocket endpoint
- `backend/app/models/audio.py` - Audio-related Pydantic models

### Dependencies

**Backend:**
```
google-genai>=1.52.0
```

### Environment Variables

```
GOOGLE_AI_API_KEY=your_api_key_here
```

---

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- Lyria RealTime API: https://ai.google.dev/api/live_music
- Lyria Guide: https://dev.to/googleai/lyria-realtime-the-developers-guide-to-infinite-music-streaming-4m1h
- Python SDK: https://github.com/google-gemini/cookbook/blob/main/quickstarts/Get_started_LyriaRealTime.ipynb

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

- `frontend/src/hooks/useLyriaStream.ts`
- `frontend/src/api/audio.ts`
- `frontend/src/utils/audio.ts`
- `backend/app/services/lyria.py`
- `backend/app/routers/audio.py`
- `backend/app/models/audio.py`
