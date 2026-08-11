from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    db_url: str
    aws_region: str
    cognito_user_pool_id: str
    cognito_app_client_id: str
    cognito_app_client_secret: str
    cognito_endpoint_url: str
    app_env: str = "development"
    use_cognito_local: bool = True


# Loaded from .env file
settings = Settings()  # pyright: ignore[reportCallIssue]
