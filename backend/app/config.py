from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    google_ai_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    nano_banana_model: str = "gemini-3.1-flash-image-preview"
    frontend_origin: str = "http://localhost:5173"
    frontend_origin_alt: str = "http://localhost:5174"
    media_root: Path = Path(__file__).resolve().parents[1] / "media"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
