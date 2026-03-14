from datetime import datetime
from typing import Literal

from pydantic import BaseModel


TaskStatus = Literal["pending", "processing", "completed", "failed"]


class ClipGenerateRequest(BaseModel):
    artist_id: str
    track_id: str


class ClipGenerateResponse(BaseModel):
    task_id: str


class TaskStatusResponse(BaseModel):
    task_id: str
    status: TaskStatus
    clip_id: str | None = None
    video_url: str | None = None
    error: str | None = None


class ClipData(BaseModel):
    clip_id: str
    task_id: str
    artist_id: str
    track_id: str
    video_url: str | None = None
    status: TaskStatus
    created_at: datetime


class FeedItemResponse(BaseModel):
    clip_id: str
    artist_id: str
    artist_name: str
    artist_avatar_url: str | None = None
    track_title: str
    video_url: str
    audio_url: str
    duration: str
    likes: int = 0
    created_at: datetime
