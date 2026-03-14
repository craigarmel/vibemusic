"""
Veo 3.1 video generation service — MOCK implementation for hackathon.

For the hackathon demo, this service simulates video generation by:
1. Accepting an artist_id + track_id
2. Sleeping for 3 seconds to simulate processing
3. Copying the track's audio file to the clips directory as a "fake video"
4. Returning clip metadata

The real implementation would call Veo 3.1 with the artist's avatar image
and audio track to generate a 9:16 vertical video (10 seconds).
"""

from __future__ import annotations

import asyncio
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.config import settings


MOCK_GENERATION_DELAY = 3.0  # seconds


async def generate_clip(
    artist_id: str,
    track_id: str,
    audio_path: str,
) -> dict:
    """
    Mock Veo 3.1 video generation.

    Simulates async video generation by sleeping, then copying the audio
    file to the clips directory as a placeholder.

    Returns clip metadata dict.
    """
    clip_id = str(uuid.uuid4())
    clip_filename = f"{clip_id}.mp4"
    clips_dir = settings.media_root / "clips"
    clips_dir.mkdir(parents=True, exist_ok=True)
    clip_path = clips_dir / clip_filename

    # Simulate generation delay
    await asyncio.sleep(MOCK_GENERATION_DELAY)

    # Copy the audio file as a fake video (hackathon mock)
    source_path = settings.media_root.parent / audio_path.lstrip("/")
    if not source_path.exists():
        # Fallback: look relative to media root
        source_path = settings.media_root / audio_path.replace("/media/", "")

    if source_path.exists():
        shutil.copy2(str(source_path), str(clip_path))
    else:
        # If audio file doesn't exist, create a minimal placeholder
        clip_path.write_bytes(b"MOCK_VIDEO_PLACEHOLDER")

    video_url = f"/media/clips/{clip_filename}"

    return {
        "clip_id": clip_id,
        "video_url": video_url,
        "artist_id": artist_id,
        "track_id": track_id,
        "created_at": datetime.now(tz=timezone.utc),
    }
