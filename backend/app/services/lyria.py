from __future__ import annotations

import asyncio
import math
import struct
import wave
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import AsyncIterator

SAMPLE_RATE = 48_000
CHUNK_SECONDS = 0.5
CHANNELS = 2
BYTES_PER_SAMPLE = 2


@dataclass
class MockLyriaSession:
    bpm: float = 118
    guidance: float = 4.0
    temperature: float = 1.1
    density: float = 0.5
    brightness: float = 0.5
    is_playing: bool = True
    _phase: float = 0.0
    captured_audio: list[bytes] = field(default_factory=list)

    async def stream_audio(self) -> AsyncIterator[bytes]:
        while self.is_playing:
            yield self.generate_chunk()
            await asyncio.sleep(CHUNK_SECONDS)

    def generate_chunk(self) -> bytes:
        frame_count = int(SAMPLE_RATE * CHUNK_SECONDS)
        amplitude = 10_000 + int(self.guidance * 1800)
        base_frequency = 150 + (self.bpm * 1.75)
        shimmer = 50 + (self.brightness * 160)
        output = bytearray()

        for frame_index in range(frame_count):
            angle = (2 * math.pi * (self._phase + frame_index) * base_frequency) / SAMPLE_RATE
            modulator = math.sin((2 * math.pi * (self._phase + frame_index) * shimmer) / SAMPLE_RATE)
            sample_left = int(amplitude * math.sin(angle) * (0.7 + self.density * 0.4))
            sample_right = int(amplitude * math.sin(angle + modulator * 0.35))
            output.extend(struct.pack("<hh", sample_left, sample_right))

        self._phase += frame_count
        self.captured_audio.append(bytes(output))
        return bytes(output)

    def update_config(self, params: dict) -> None:
        self.bpm = float(params.get("bpm", self.bpm))
        self.guidance = float(params.get("guidance", self.guidance))
        self.temperature = float(params.get("temperature", self.temperature))
        self.density = float(params.get("density", self.density))
        self.brightness = float(params.get("brightness", self.brightness))

    def handle_control(self, control: str) -> None:
        if control == "PLAY":
            self.is_playing = True
        else:
            self.is_playing = False


class LyriaService:
    def __init__(self) -> None:
        self.sessions: dict[str, MockLyriaSession] = {}

    def get_session(self, session_id: str) -> MockLyriaSession:
        return self.sessions.setdefault(session_id, MockLyriaSession())

    def append_client_audio(self, session_id: str, audio_bytes: bytes) -> None:
        self.get_session(session_id).captured_audio.append(audio_bytes)

    async def iter_audio(self, session_id: str) -> AsyncIterator[bytes]:
        async for chunk in self.get_session(session_id).stream_audio():
            yield chunk

    def update_session(self, session_id: str, params: dict) -> None:
        self.get_session(session_id).update_config(params)

    def set_control(self, session_id: str, control: str) -> None:
        self.get_session(session_id).handle_control(control)

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
        final_audio = b"".join(session.captured_audio[-12:]) or session.generate_chunk()
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
