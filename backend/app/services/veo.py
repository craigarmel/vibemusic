"""
Veo 3.1 video generation service — REAL implementation using Google GenAI.

Calls the Veo 3.1 API to generate 9:16 portrait music videos.
If the artist has an avatar image, it is passed as image input for
image-to-video generation so the avatar character appears in the clip.
"""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

from google import genai
from google.genai import types

from app import storage
from app.config import settings

logger = logging.getLogger(__name__)

POLL_INTERVAL_SECONDS = 10


def _build_prompt(artist_id: str) -> str:
    """Build a music-video prompt from the artist's lore."""
    artist = storage.artists.get(artist_id, {})
    lore = artist.get("lore", {})
    name = lore.get("name", "an AI musician")
    genre = lore.get("genre", "electronic")
    biography = lore.get("biography", "")
    visual_style = lore.get("visual_style", "")
    aesthetic = lore.get("aesthetic", "")

    prompt_parts = [
        f"A cinematic vertical music video for the artist {name}.",
        f"Genre: {genre}." if genre else "",
        f"Visual aesthetic: {visual_style or aesthetic}." if (visual_style or aesthetic) else "",
        f"The artist: {biography[:200]}." if biography else "",
        "Dynamic camera movement, dramatic lighting, high production value.",
        "Portrait orientation 9:16 format, designed for mobile viewing.",
    ]
    return " ".join(part for part in prompt_parts if part)


def _resolve_avatar_path(artist_id: str) -> Path | None:
    """Return the local filesystem path of the artist avatar, or None."""
    artist = storage.artists.get(artist_id, {})
    avatar_url = artist.get("avatar_url")  # e.g. "/media/avatars/abc.png"
    if not avatar_url:
        return None

    # avatar_url is like "/media/avatars/<file>", resolve to disk
    relative = avatar_url.lstrip("/")  # "media/avatars/<file>"
    # media_root is  …/backend/media, so strip the leading "media/" part
    if relative.startswith("media/"):
        relative = relative[len("media/"):]
    path = settings.media_root / relative
    if path.exists():
        return path

    return None


def _blocking_generate(prompt: str, avatar_path: Path | None) -> Path:
    """
    Synchronous (blocking) call to Veo 3.1.

    Returns the local Path where the generated video has been saved.
    """
    client = genai.Client(api_key=settings.google_ai_api_key)

    generate_kwargs: dict = {
        "model": "veo-3.1-generate-preview",
        "prompt": prompt,
        "config": types.GenerateVideosConfig(
            aspect_ratio="9:16",
        ),
    }

    # If we have an avatar, pass it as the image input for image-to-video
    if avatar_path is not None:
        try:
            image_bytes = avatar_path.read_bytes()
            # Determine MIME type from extension
            suffix = avatar_path.suffix.lower()
            mime_map = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}
            mime_type = mime_map.get(suffix, "image/png")
            avatar_image = types.Image(image_bytes=image_bytes, mime_type=mime_type)
            generate_kwargs["image"] = avatar_image
        except Exception:
            logger.warning(
                "Failed to load avatar image at %s; falling back to text-to-video",
                avatar_path,
                exc_info=True,
            )

    logger.info("Starting Veo 3.1 generation (avatar=%s)", avatar_path is not None)
    operation = client.models.generate_videos(**generate_kwargs)

    # Poll until done
    max_attempts = 60  # 10 minutes max
    for attempt in range(max_attempts):
        if operation.done:
            break
        time.sleep(POLL_INTERVAL_SECONDS)
        try:
            operation = client.operations.get(operation)
        except Exception as e:
            logger.warning("Poll attempt %d failed: %s", attempt, e)

    # Ensure output directory exists
    clips_dir = settings.media_root / "clips"
    clips_dir.mkdir(parents=True, exist_ok=True)
    clip_id = str(uuid.uuid4())
    clip_path = clips_dir / f"{clip_id}.mp4"

    # Check if generation succeeded
    if not operation.done:
        raise RuntimeError("Veo 3.1 video generation timed out after 10 minutes")

    if operation.response is None:
        error_msg = getattr(operation, 'error', 'Unknown error')
        raise RuntimeError(f"Veo 3.1 generation failed: {error_msg}")

    if not operation.response.generated_videos:
        raise RuntimeError("Veo 3.1 returned no videos — prompt may have been filtered")

    generated_video = operation.response.generated_videos[0]

    try:
        client.files.download(file=generated_video.video)
        generated_video.video.save(str(clip_path))
    except Exception as e:
        raise RuntimeError(f"Failed to download/save Veo video: {e}")

    logger.info("Veo 3.1 video saved to %s", clip_path)
    return clip_path


async def generate_clip(
    artist_id: str,
    track_id: str,
    audio_path: str,
) -> dict:
    """
    Generate a music video clip via Veo 3.1.

    The heavy network I/O + polling runs in a thread so the event loop
    stays responsive.

    Returns a clip metadata dict.
    """
    prompt = _build_prompt(artist_id)
    avatar_path = _resolve_avatar_path(artist_id)

    # Run the blocking API call in a background thread
    clip_path = await asyncio.to_thread(_blocking_generate, prompt, avatar_path)

    clip_id = clip_path.stem  # uuid without extension
    video_url = f"/media/clips/{clip_path.name}"

    return {
        "clip_id": clip_id,
        "video_url": video_url,
        "artist_id": artist_id,
        "track_id": track_id,
        "created_at": datetime.now(tz=timezone.utc),
    }
