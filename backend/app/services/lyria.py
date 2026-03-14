from __future__ import annotations

import asyncio
import logging
import wave
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import AsyncIterator

from google import genai
from google.genai import types

from app.config import settings

logger = logging.getLogger(__name__)

SAMPLE_RATE = 48_000
CHANNELS = 2
BYTES_PER_SAMPLE = 2
MODEL = "models/lyria-realtime-exp"


def _make_lyria_client() -> genai.Client:
    """Create a genai client configured for the Lyria v1alpha API."""
    return genai.Client(
        api_key=settings.google_ai_api_key,
        http_options={"api_version": "v1alpha"},
    )


@dataclass
class LyriaSession:
    """Wraps a single Lyria RealTime session with its state and audio buffer."""

    # Generation parameters
    bpm: float = 118
    guidance: float = 4.0
    temperature: float = 1.1
    density: float = 0.5
    brightness: float = 0.5

    # Prompt text derived from session context
    prompt: str = "ambient electronic"

    # Internal state
    is_playing: bool = False
    _connected: bool = False
    _session: object | None = None  # genai live music session handle
    _audio_queue: asyncio.Queue[bytes | None] = field(default_factory=lambda: asyncio.Queue())
    _receive_task: asyncio.Task | None = field(default=None, repr=False)
    captured_audio: list[bytes] = field(default_factory=list)
    _lock: asyncio.Lock = field(default_factory=asyncio.Lock)

    # ------------------------------------------------------------------
    # Connection lifecycle
    # ------------------------------------------------------------------

    async def connect(self) -> None:
        """Open the Lyria RealTime WebSocket connection."""
        if self._connected:
            return
        client = _make_lyria_client()
        ctx = client.aio.live.music.connect(model=MODEL)
        self._session = await ctx.__aenter__()
        self._connected = True
        # Store the context manager so we can close it later
        self._ctx = ctx

        # Apply initial config + prompt
        await self._apply_prompts()
        await self._apply_config()

        logger.info("Lyria session connected")

    async def disconnect(self) -> None:
        """Tear down the Lyria connection."""
        if self._receive_task and not self._receive_task.done():
            self._receive_task.cancel()
            try:
                await self._receive_task
            except asyncio.CancelledError:
                pass
            self._receive_task = None

        if self._connected and self._session is not None:
            try:
                await self._ctx.__aexit__(None, None, None)
            except Exception:
                logger.debug("Error closing Lyria session", exc_info=True)
            self._session = None
            self._connected = False

        # Signal any waiting consumers to exit
        self._audio_queue.put_nowait(None)

    # ------------------------------------------------------------------
    # Receive loop – pulls audio chunks from Lyria into the queue
    # ------------------------------------------------------------------

    async def _receive_loop(self) -> None:
        """Background task: read audio from Lyria and enqueue chunks."""
        try:
            async for message in self._session.receive():
                if not self.is_playing:
                    break
                if message.server_content and message.server_content.audio_chunks:
                    audio_data = message.server_content.audio_chunks[0].data
                    self.captured_audio.append(audio_data)
                    await self._audio_queue.put(audio_data)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Lyria receive loop error")
        finally:
            # Sentinel so iter_audio knows we're done
            await self._audio_queue.put(None)

    # ------------------------------------------------------------------
    # Streaming
    # ------------------------------------------------------------------

    async def start_streaming(self) -> None:
        """Tell Lyria to play and start the background receive loop."""
        if not self._connected:
            await self.connect()
        self.is_playing = True
        await self._session.play()
        # Launch the background receiver
        if self._receive_task is None or self._receive_task.done():
            self._receive_task = asyncio.create_task(self._receive_loop())

    async def stream_audio(self) -> AsyncIterator[bytes]:
        """Yield audio chunks as they arrive from Lyria."""
        await self.start_streaming()
        while True:
            chunk = await self._audio_queue.get()
            if chunk is None:
                break
            yield chunk

    # ------------------------------------------------------------------
    # Config helpers
    # ------------------------------------------------------------------

    async def _apply_prompts(self) -> None:
        if self._session is None:
            return
        await self._session.set_weighted_prompts(
            prompts=[types.WeightedPrompt(text=self.prompt, weight=1.0)]
        )

    async def _apply_config(self) -> None:
        if self._session is None:
            return
        await self._session.set_music_generation_config(
            config=types.LiveMusicGenerationConfig(
                bpm=int(self.bpm),
                temperature=self.temperature,
            )
        )

    async def update_config(self, params: dict) -> None:
        self.bpm = float(params.get("bpm", self.bpm))
        self.guidance = float(params.get("guidance", self.guidance))
        self.temperature = float(params.get("temperature", self.temperature))
        self.density = float(params.get("density", self.density))
        self.brightness = float(params.get("brightness", self.brightness))

        if "prompt" in params:
            self.prompt = params["prompt"]
            await self._apply_prompts()

        await self._apply_config()

    async def handle_control(self, control: str) -> None:
        if not self._connected:
            await self.connect()

        if control == "PLAY":
            self.is_playing = True
            await self._session.play()
            # Restart receiver if it stopped
            if self._receive_task is None or self._receive_task.done():
                self._receive_task = asyncio.create_task(self._receive_loop())

        elif control == "PAUSE":
            self.is_playing = False
            await self._session.pause()

        elif control == "STOP":
            self.is_playing = False
            await self._session.stop()
            await self.disconnect()

        elif control == "RESET":
            await self._session.reset_context()


class LyriaService:
    def __init__(self) -> None:
        self.sessions: dict[str, LyriaSession] = {}

    def get_session(self, session_id: str) -> LyriaSession:
        return self.sessions.setdefault(session_id, LyriaSession())

    def append_client_audio(self, session_id: str, audio_bytes: bytes) -> None:
        self.get_session(session_id).captured_audio.append(audio_bytes)

    async def iter_audio(self, session_id: str) -> AsyncIterator[bytes]:
        async for chunk in self.get_session(session_id).stream_audio():
            yield chunk

    async def update_session(self, session_id: str, params: dict) -> None:
        await self.get_session(session_id).update_config(params)

    async def set_control(self, session_id: str, control: str) -> None:
        await self.get_session(session_id).handle_control(control)

    async def cleanup_session(self, session_id: str) -> None:
        """Disconnect and remove a session."""
        session = self.sessions.pop(session_id, None)
        if session is not None:
            await session.disconnect()

    def build_final_track(
        self,
        session_id: str,
        artist_id: str,
        output_path: Path,
        influences: list[str],
        music_prompt: str = "",
        performance_notes: str = "",
        avatar_url: str | None = None,
        generation_target: str = "suno",
    ) -> dict:
        session = self.get_session(session_id)
        # Use up to the last 12 captured chunks (same policy as before)
        final_audio = b"".join(session.captured_audio[-12:])
        if not final_audio:
            # Edge case: nothing captured – write silence so the WAV is valid
            final_audio = b"\x00" * (SAMPLE_RATE * CHANNELS * BYTES_PER_SAMPLE)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with wave.open(str(output_path), "wb") as wav_file:
            wav_file.setnchannels(CHANNELS)
            wav_file.setsampwidth(BYTES_PER_SAMPLE)
            wav_file.setframerate(SAMPLE_RATE)
            wav_file.writeframes(final_audio)

        duration_seconds = len(final_audio) / (SAMPLE_RATE * CHANNELS * BYTES_PER_SAMPLE)
        return {
            "track_id": output_path.stem,
            "session_id": session_id,
            "artist_id": artist_id,
            "audio_url": f"/media/audio/{output_path.name}",
            "duration_seconds": round(duration_seconds, 2),
            "created_at": datetime.now(tz=timezone.utc),
            "status": "draft",
            "influences": influences,
            "music_prompt": music_prompt,
            "performance_notes": performance_notes,
            "avatar_url": avatar_url,
            "generation_target": generation_target,
        }


lyria_service = LyriaService()
