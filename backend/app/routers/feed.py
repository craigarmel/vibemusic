from collections import Counter

from fastapi import APIRouter

from app import storage
from app.models.feed import FeedClip, FeedResponse, InfluenceRequest

router = APIRouter(prefix="/api", tags=["feed"])

# ---------------------------------------------------------------------------
# Mock data — used when no real clips exist yet (hackathon convenience).
# These use placeholder video URLs from public test sources.
# ---------------------------------------------------------------------------
MOCK_CLIPS: list[dict] = [
    {
        "clip_id": "clip-mock-001",
        "artist_id": "artist-neon-01",
        "artist_name": "NEON MIRAGE",
        "artist_avatar_url": None,
        "track_title": "Nightfall Protocol",
        "video_url": "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
        "duration": "0:10",
        "likes": 237,
        "created_at": "2026-03-14T10:00:00Z",
    },
    {
        "clip_id": "clip-mock-002",
        "artist_id": "artist-neon-02",
        "artist_name": "ECHO DRIFT",
        "artist_avatar_url": None,
        "track_title": "Chrome Lullaby",
        "video_url": "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
        "duration": "0:10",
        "likes": 184,
        "created_at": "2026-03-14T09:30:00Z",
    },
    {
        "clip_id": "clip-mock-003",
        "artist_id": "artist-neon-03",
        "artist_name": "VOID EMPRESS",
        "artist_avatar_url": None,
        "track_title": "Synthetic Tears",
        "video_url": "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
        "duration": "0:10",
        "likes": 412,
        "created_at": "2026-03-14T09:00:00Z",
    },
    {
        "clip_id": "clip-mock-004",
        "artist_id": "artist-neon-04",
        "artist_name": "PULSE WRAITH",
        "artist_avatar_url": None,
        "track_title": "Basement Frequencies",
        "video_url": "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
        "duration": "0:10",
        "likes": 96,
        "created_at": "2026-03-14T08:30:00Z",
    },
    {
        "clip_id": "clip-mock-005",
        "artist_id": "artist-neon-05",
        "artist_name": "STATIC BLOOM",
        "artist_avatar_url": None,
        "track_title": "Digital Garden",
        "video_url": "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
        "duration": "0:10",
        "likes": 328,
        "created_at": "2026-03-14T08:00:00Z",
    },
]


@router.get("/feed")
async def get_feed():
    """Return published clips for the fan feed.

    Falls back to mock data when no real clips have been generated yet,
    so the frontend always has content to display during the hackathon demo.
    """
    real_clips: list[dict] = []

    for clip in storage.clips:
        # Each clip in storage may have artist_id — look up artist info.
        artist_id = clip.get("artist_id", "")
        track_id = clip.get("track_id", "")
        artist = storage.artists.get(artist_id, {})
        track = storage.tracks.get(track_id, {})
        lore = artist.get("lore", {})

        # Build duration string from track data if available
        duration_seconds = track.get("duration_seconds", 0)
        if duration_seconds:
            minutes = int(duration_seconds // 60)
            seconds = int(duration_seconds % 60)
            duration_str = f"{minutes}:{seconds:02d}"
        else:
            duration_str = clip.get("duration", "0:10")

        # Track title: use music_prompt or fallback
        track_title = track.get("music_prompt") or clip.get("track_title", clip.get("title", ""))
        if not track_title:
            track_title = f"Track {track_id[:8]}" if track_id else "Untitled"

        # Video URL: prefer clip video_url, fallback to audio
        video_url = clip.get("video_url") or track.get("audio_url") or ""

        real_clips.append(
            {
                "clip_id": clip.get("clip_id", clip.get("track_id", "")),
                "artist_id": artist_id,
                "artist_name": lore.get("name", artist.get("name", "Unknown Artist")),
                "artist_avatar_url": artist.get("avatar_url"),
                "track_title": track_title,
                "video_url": video_url,
                "duration": duration_str,
                "likes": clip.get("likes", 0),
                "created_at": str(clip.get("created_at", "")),
            }
        )

    # Use real clips if available, otherwise serve mock data.
    clips_data = real_clips if real_clips else MOCK_CLIPS
    feed = FeedResponse(
        clips=[FeedClip(**c) for c in clips_data],
        total=len(clips_data),
    )

    return {"status": "success", "data": feed.model_dump()}


@router.post("/feed/influence")
async def submit_influence(request: InfluenceRequest):
    """Store a fan influence tag for an artist's clip."""
    influence = {
        "artist_id": request.artist_id,
        "clip_id": request.clip_id,
        "tag": request.tag,
        "created_at": storage.utc_now().isoformat(),
    }
    storage.influences.append(influence)

    return {
        "status": "success",
        "data": influence,
    }


@router.get("/artists/{artist_id}/influences")
async def get_artist_influences(artist_id: str):
    """Return aggregated influence tags for an artist."""
    artist_influences = [
        inf for inf in storage.influences if inf.get("artist_id") == artist_id
    ]

    tag_counts = Counter(inf["tag"] for inf in artist_influences)
    sorted_tags = [
        {"tag": tag, "count": count}
        for tag, count in tag_counts.most_common()
    ]

    return {
        "status": "success",
        "data": {
            "artist_id": artist_id,
            "total_influences": len(artist_influences),
            "tags": sorted_tags,
        },
    }
