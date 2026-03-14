from __future__ import annotations

import asyncio
import json
from contextlib import suppress
from datetime import datetime, timezone
from uuid import uuid4

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
    track = lyria_service.build_final_track(session_id, request.artist_id, output_path, request.influences)
    tracks[track_id] = track
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

    async def sender():
        async for chunk in lyria_service.iter_audio(session_id):
            await websocket.send_bytes(chunk)

    async def receiver():
        influence_cursor = 0
        suggested_tags = ["Plus sombre", "Plus de basses", "Melodique", "Experimental"]
        while True:
            message = await websocket.receive()
            if message.get("bytes") is not None:
                lyria_service.append_client_audio(session_id, message["bytes"])
            elif message.get("text") is not None:
                payload = json.loads(message["text"])
                message_type = payload.get("type")
                data = payload.get("data", {})
                if message_type in {"setup", "music_generation_config"}:
                    lyria_service.update_session(session_id, data)
                elif message_type == "playback_control":
                    control = data.get("control", "PLAY")
                    lyria_service.set_control(session_id, control)
                    if control == "STOP":
                        return

                if message_type in {"setup", "music_generation_config"} and influence_cursor < len(suggested_tags):
                    influence = {
                        "tag": suggested_tags[influence_cursor],
                        "received_at": datetime.now(tz=timezone.utc).isoformat(),
                    }
                    influence_cursor += 1
                    influences.append({"session_id": session_id, **influence})
                    await websocket.send_json({"type": "influence", "data": influence})

    send_task = asyncio.create_task(sender())
    receive_task = asyncio.create_task(receiver())

    done, pending = await asyncio.wait({send_task, receive_task}, return_when=asyncio.FIRST_EXCEPTION)

    for task in pending:
        task.cancel()
        with suppress(asyncio.CancelledError):
            await task

    for task in done:
        exc = task.exception()
        if exc and not isinstance(exc, WebSocketDisconnect):
            raise exc
