from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    db_url: str
    cognito_user_pool_id: str
    cognito_region: str
    cognito_app_client_id: str


# Loaded from .env file
settings = Settings()  # pyright: ignore[reportCallIssue]
