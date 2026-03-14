from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    google_ai_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    nano_banana_model: str = "gemini-3.1-flash-image-preview"
    frontend_origin: str = "http://localhost:5173"
    frontend_origin_alt: str = "http://127.0.0.1:5173"
    # Comma-separated list for production (e.g. "https://vibemusic.vercel.app,https://vibemusic-front.vercel.app")
    frontend_origins_extra: str = ""
    media_root: Path = Path(__file__).resolve().parents[1] / "media"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
