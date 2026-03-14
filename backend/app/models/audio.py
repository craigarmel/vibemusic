from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class SessionCreateRequest(BaseModel):
    artist_id: str


class SessionResponse(BaseModel):
    session_id: str
    artist_id: str
    start_time: datetime
    status: Literal["active", "completed"]


class SessionCompleteRequest(BaseModel):
    artist_id: str
    influences: list[str] = Field(default_factory=list)


class TrackResponse(BaseModel):
    track_id: str
    session_id: str
    artist_id: str
    audio_url: str
    duration_seconds: float
    created_at: datetime
    status: Literal["draft", "published"]
    influences: list[str] = Field(default_factory=list)


class PublishClipRequest(BaseModel):
    track_id: str
    artist_id: str
    status: Literal["draft", "published"]
