from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # database settings
    db_url: str

    # aws general settings
    aws_region: str
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None

    # cognito settings
    cognito_user_pool_id: str | None = None
    cognito_app_client_id: str
    cognito_app_client_secret: str
    cognito_endpoint_url: str

    # s3 settings
    s3_endpoint_url: str | None = None
    s3_it_manuals_bucket: str
    s3_hr_policies_bucket: str

    # bedrock settings:
    bedrock_endpoint_url: str | None = None
    embedding_model: str
    llm: str

    # development settings
    app_env: str = "development"
    use_cognito_local: bool = True
    cookie_secure: bool = True


# Loaded from .env file
settings = Settings()  # pyright: ignore[reportCallIssue]
