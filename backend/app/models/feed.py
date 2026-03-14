from pydantic import BaseModel


class FeedClip(BaseModel):
    clip_id: str
    artist_id: str
    artist_name: str
    artist_avatar_url: str | None = None
    track_title: str
    video_url: str
    duration: str
    likes: int = 0
    created_at: str


class FeedResponse(BaseModel):
    clips: list[FeedClip]
    total: int


class InfluenceRequest(BaseModel):
    artist_id: str
    clip_id: str
    tag: str


class TagCount(BaseModel):
    tag: str
    count: int


class ArtistInfluencesResponse(BaseModel):
    artist_id: str
    total_influences: int
    tags: list[TagCount]
