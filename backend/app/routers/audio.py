from __future__ import annotations

import asyncio
import json
import logging
from contextlib import suppress
from datetime import datetime, timezone
from uuid import uuid4

logger = logging.getLogger(__name__)

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from app.config import settings
from app.models.audio import (
    PublishClipRequest,
    SessionCompleteRequest,
    SessionCreateRequest,
    SessionResponse,
    TrackResponse,
)
from app.services.lyria import lyria_service
from app.storage import artists, clips, influences, sessions, tracks, utc_now

router = APIRouter(prefix="/api", tags=["audio"])


@router.post("/sessions")
async def create_session(request: SessionCreateRequest):
    if request.artist_id not in artists:
        artists[request.artist_id] = {"artist_id": request.artist_id, "name": "NEON MIRAGE"}

    session = {
        "session_id": str(uuid4()),
        "artist_id": request.artist_id,
        "start_time": utc_now(),
        "status": "active",
        "music_prompt": request.music_prompt,
        "performance_notes": request.performance_notes,
        "avatar_prompt": request.avatar_prompt,
        "avatar_url": request.avatar_url,
    }
    sessions[session["session_id"]] = session
    return {"status": "success", "data": SessionResponse.model_validate(session).model_dump(mode="json")}


@router.post("/sessions/{session_id}/complete")
async def complete_session(session_id: str, request: SessionCompleteRequest):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session["status"] = "completed"
    track_id = str(uuid4())
    output_path = settings.media_root / "audio" / f"{track_id}.wav"
    track = lyria_service.build_final_track(
        session_id,
        request.artist_id,
        output_path,
        request.influences,
        music_prompt=request.music_prompt,
        performance_notes=request.performance_notes,
        avatar_url=request.avatar_url,
        generation_target=request.generation_target,
    )
    tracks[track_id] = track

    # Clean up Lyria session now that the track is built
    await lyria_service.cleanup_session(session_id)

    return {"status": "success", "data": TrackResponse.model_validate(track).model_dump(mode="json")}


@router.post("/clips")
async def publish_clip(request: PublishClipRequest):
    track = tracks.get(request.track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    track["status"] = request.status
    clips.append(
        {
            "clip_id": str(uuid4()),
            "track_id": request.track_id,
            "artist_id": request.artist_id,
            "status": request.status,
            "created_at": utc_now(),
        }
    )
    return {"status": "success", "data": TrackResponse.model_validate(track).model_dump(mode="json")}


@router.websocket("/audio/stream")
async def audio_stream(websocket: WebSocket, session_id: str):
    session = sessions.get(session_id)
    if not session:
        await websocket.close(code=4404)
        return

    await websocket.accept()

    # Pass the music_prompt from the session to Lyria as the initial prompt
    music_prompt = session.get("music_prompt", "")
    if music_prompt:
        lyria_session = lyria_service.get_session(session_id)
        lyria_session.prompt = music_prompt

    async def sender():
        try:
            async for chunk in lyria_service.iter_audio(session_id):
                try:
                    await websocket.send_bytes(chunk)
                except (WebSocketDisconnect, RuntimeError):
                    return
        except Exception as e:
            logger.warning("Sender error: %s", e)

    async def receiver():
        influence_cursor = 0
        suggested_tags = ["Plus sombre", "Plus de basses", "Melodique", "Experimental"]
        try:
            while True:
                message = await websocket.receive()

                # Check for disconnect
                if message.get("type") == "websocket.disconnect":
                    return

                if message.get("bytes") is not None:
                    lyria_service.append_client_audio(session_id, message["bytes"])
                elif message.get("text") is not None:
                    payload = json.loads(message["text"])
                    message_type = payload.get("type")
                    data = payload.get("data", {})
                    if message_type in {"setup", "music_generation_config"}:
                        await lyria_service.update_session(session_id, data)
                    elif message_type == "playback_control":
                        control = data.get("control", "PLAY")
                        await lyria_service.set_control(session_id, control)
                        if control == "STOP":
                            return

                    if message_type in {"setup", "music_generation_config"} and influence_cursor < len(suggested_tags):
                        influence = {
                            "tag": suggested_tags[influence_cursor],
                            "received_at": datetime.now(tz=timezone.utc).isoformat(),
                        }
                        influence_cursor += 1
                        influences.append({"session_id": session_id, **influence})
                        try:
                            await websocket.send_json({"type": "influence", "data": influence})
                        except (WebSocketDisconnect, RuntimeError):
                            return
        except (WebSocketDisconnect, RuntimeError):
            return
        except Exception as e:
            logger.warning("Receiver error: %s", e)

    send_task = asyncio.create_task(sender())
    receive_task = asyncio.create_task(receiver())

    try:
        done, pending = await asyncio.wait({send_task, receive_task}, return_when=asyncio.FIRST_COMPLETED)

        for task in pending:
            task.cancel()
            with suppress(asyncio.CancelledError):
                await task
    finally:
        # Don't cleanup Lyria session here — it persists for reconnections
        # and gets cleaned up in /sessions/{id}/complete
        logger.info("WebSocket closed for session %s", session_id)
