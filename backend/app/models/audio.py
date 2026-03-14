from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


AvatarSource = Literal["prompt", "camera", "upload"]


class SessionCreateRequest(BaseModel):
    artist_id: str
    music_prompt: str = ""
    performance_notes: str = ""
    avatar_prompt: str = ""
    avatar_url: str | None = None


class SessionResponse(BaseModel):
    session_id: str
    artist_id: str
    start_time: datetime
    status: Literal["active", "completed"]
    music_prompt: str = ""
    performance_notes: str = ""
    avatar_prompt: str = ""
    avatar_url: str | None = None


class SessionCompleteRequest(BaseModel):
    artist_id: str
    influences: list[str] = Field(default_factory=list)
    music_prompt: str = ""
    performance_notes: str = ""
    avatar_url: str | None = None
    generation_target: str = "suno"


class TrackResponse(BaseModel):
    track_id: str
    session_id: str
    artist_id: str
    audio_url: str
    duration_seconds: float
    created_at: datetime
    status: Literal["draft", "published"]
    influences: list[str] = Field(default_factory=list)
    music_prompt: str = ""
    performance_notes: str = ""
    avatar_url: str | None = None
    generation_target: str = "suno"


class PublishClipRequest(BaseModel):
    track_id: str
    artist_id: str
    status: Literal["draft", "published"]


class AvatarGenerateRequest(BaseModel):
    prompt: str = ""
    source: AvatarSource = "prompt"
    reference_image: str | None = None


class AvatarResponse(BaseModel):
    avatar_id: str
    image_url: str
    prompt: str
    source: AvatarSource
    provider: str
    created_at: datetime
