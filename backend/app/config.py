from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    gemini_api_key: str = ""
    gemini_model_primary: str = "gemini-3.5-flash"
    gemini_model_fallback: str = "gemini-flash-lite-latest"

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    cors_origin_regex: str = r"https://.*\.(vercel\.app|onrender\.com)"


@lru_cache
def get_settings() -> Settings:
    return Settings()
