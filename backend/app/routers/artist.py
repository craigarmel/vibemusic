import logging
import time
import uuid

from fastapi import APIRouter, HTTPException

from app.models.artist import ArtistCreateRequest, LoreData

logger = logging.getLogger(__name__)
from app.services import gemini, nano_banana
from app import storage

router = APIRouter(prefix="/api", tags=["artists"])


@router.post("/artists")
async def create_artist(request: ArtistCreateRequest):
    """Generate artist lore from a creative prompt using Gemini."""
    try:
        lore_data = await gemini.generate_lore(request.prompt)
    except Exception as e:
        logger.exception("Gemini lore generation failed")
        error_msg = str(e)
        if "timeout" in error_msg.lower() or "rate" in error_msg.lower():
            raise HTTPException(
                status_code=503,
                detail={"status": "error", "message": "AI service temporarily unavailable", "detail": error_msg},
            )
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": "Failed to generate artist lore", "detail": error_msg},
        )

    artist_id = str(uuid.uuid4())
    lore = LoreData(**lore_data)

    storage.artists[artist_id] = {
        "artist_id": artist_id,
        "prompt": request.prompt,
        "lore": lore.model_dump(),
        "avatar_url": None,
        "avatar_prompt": None,
    }

    return {
        "status": "success",
        "data": {
            "artist_id": artist_id,
            "lore": lore.model_dump(),
        },
    }


@router.get("/artists/{artist_id}")
async def get_artist(artist_id: str):
    """Get full artist data by ID."""
    if artist_id not in storage.artists:
        raise HTTPException(status_code=404, detail={"status": "error", "message": "Artist not found"})

    artist = storage.artists[artist_id]
    return {
        "status": "success",
        "data": {
            "artist_id": artist["artist_id"],
            "prompt": artist.get("prompt", ""),
            "lore": artist.get("lore"),
            "avatar_url": artist.get("avatar_url"),
        },
    }


@router.post("/artists/{artist_id}/avatar")
async def generate_artist_avatar(artist_id: str):
    """Generate an avatar image for an artist using Nano Banana 2."""
    if artist_id not in storage.artists:
        raise HTTPException(status_code=404, detail={"status": "error", "message": "Artist not found"})

    artist = storage.artists[artist_id]
    lore = artist.get("lore", {})
    artist_name = lore.get("name", "Unknown Artist")
    artist_bio = lore.get("biography", artist.get("prompt", ""))
    existing_prompt = artist.get("avatar_prompt")

    try:
        image_bytes, prompt_used = await nano_banana.generate_avatar(
            artist_name=artist_name,
            artist_description=artist_bio,
            existing_prompt=existing_prompt,
        )
    except Exception as e:
        error_msg = str(e)
        if "timeout" in error_msg.lower() or "rate" in error_msg.lower():
            raise HTTPException(
                status_code=503,
                detail={"status": "error", "message": "Image generation service temporarily unavailable", "detail": error_msg},
            )
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": "Failed to generate avatar", "detail": error_msg},
        )

    filename = f"{artist_id}_{int(time.time())}.png"
    filepath = f"media/avatars/{filename}"
    with open(filepath, "wb") as f:
        f.write(image_bytes)

    avatar_url = f"/media/avatars/{filename}"
    storage.artists[artist_id]["avatar_url"] = avatar_url
    storage.artists[artist_id]["avatar_prompt"] = prompt_used

    return {
        "status": "success",
        "data": {
            "artist_id": artist_id,
            "avatar_url": avatar_url,
        },
    }
