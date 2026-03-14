from __future__ import annotations

import asyncio
import uuid

from fastapi import APIRouter, HTTPException

from app.models.audio import AvatarGenerateRequest, AvatarResponse
from app.models.video import ClipGenerateRequest, ClipGenerateResponse, TaskStatusResponse
from app.services.nano_banana import nano_banana_service
from app.services import veo
from app import storage

router = APIRouter(prefix="/api", tags=["video"])


# ── Avatar generation (kept from previous epic) ──────────────────────


@router.post("/avatars/generate")
async def generate_avatar(request: AvatarGenerateRequest):
    avatar = nano_banana_service.generate_avatar(
        prompt=request.prompt,
        source=request.source,
        reference_image=request.reference_image,
    )
    return {"status": "success", "data": AvatarResponse.model_validate(avatar).model_dump(mode="json")}


# ── Video clip generation (Epic 4) ───────────────────────────────────


@router.post("/clips/generate")
async def generate_clip(request: ClipGenerateRequest):
    """
    Kick off async video clip generation via Veo 3.1 (mock).
    Returns a task_id immediately; frontend polls /api/tasks/{task_id}/status.
    """
    # Validate artist exists
    if request.artist_id not in storage.artists:
        raise HTTPException(status_code=404, detail={"status": "error", "message": "Artist not found"})

    # Validate track exists
    if request.track_id not in storage.tracks:
        raise HTTPException(status_code=404, detail={"status": "error", "message": "Track not found"})

    track = storage.tracks[request.track_id]
    audio_url = track.get("audio_url", "")

    task_id = str(uuid.uuid4())

    # Store task as pending
    storage.tasks[task_id] = {
        "task_id": task_id,
        "status": "processing",
        "artist_id": request.artist_id,
        "track_id": request.track_id,
        "clip_id": None,
        "video_url": None,
        "error": None,
    }

    # Launch background generation
    asyncio.create_task(_run_generation(task_id, request.artist_id, request.track_id, audio_url))

    return {
        "status": "success",
        "data": ClipGenerateResponse(task_id=task_id).model_dump(),
    }


async def _run_generation(task_id: str, artist_id: str, track_id: str, audio_url: str) -> None:
    """Background task that runs the mock Veo generation."""
    try:
        result = await veo.generate_clip(
            artist_id=artist_id,
            track_id=track_id,
            audio_path=audio_url,
        )

        clip_data = {
            "clip_id": result["clip_id"],
            "task_id": task_id,
            "artist_id": artist_id,
            "track_id": track_id,
            "video_url": result["video_url"],
            "status": "completed",
            "created_at": result["created_at"],
        }

        # Store the clip
        storage.clips.append(clip_data)

        # Update task as completed
        storage.tasks[task_id].update({
            "status": "completed",
            "clip_id": result["clip_id"],
            "video_url": result["video_url"],
        })

    except Exception as e:
        storage.tasks[task_id].update({
            "status": "failed",
            "error": str(e),
        })


@router.get("/tasks/{task_id}/status")
async def get_task_status(task_id: str):
    """Poll for the status of an async video generation task."""
    task = storage.tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail={"status": "error", "message": "Task not found"})

    return {
        "status": "success",
        "data": TaskStatusResponse(
            task_id=task["task_id"],
            status=task["status"],
            clip_id=task.get("clip_id"),
            video_url=task.get("video_url"),
            error=task.get("error"),
        ).model_dump(),
    }
