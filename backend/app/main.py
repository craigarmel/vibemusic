import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import artist, audio, video, feed

app = FastAPI(title="Synthetica API")

def _cors_origins() -> list[str]:
    origins = [settings.frontend_origin, settings.frontend_origin_alt]
    if settings.frontend_origins_extra:
        origins.extend(o.strip() for o in settings.frontend_origins_extra.split(",") if o.strip())
    return origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(artist.router)
app.include_router(audio.router)
app.include_router(video.router)
app.include_router(feed.router)

# Ensure media directories exist
for d in ["media/avatars", "media/audio", "media/clips"]:
    os.makedirs(d, exist_ok=True)

app.mount("/media", StaticFiles(directory="media"), name="media")


@app.get("/api/health")
async def health():
    return {"status": "success", "data": {"service": "synthetica"}}
