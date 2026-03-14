from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    google_ai_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    nano_banana_model: str = "gemini-3.1-flash-image-preview"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
