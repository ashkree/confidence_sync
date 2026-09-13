import boto3

from app.config import settings


class AWSRepo:
    def __init__(self, service: str, region_name: str | None = None, **kwargs):
        kwargs = {k: v for k, v in kwargs.items() if v is not None}
        creds = {}
        if settings.aws_access_key_id and settings.aws_secret_access_key:
            creds = {
                "aws_access_key_id": settings.aws_access_key_id,
                "aws_secret_access_key": settings.aws_secret_access_key,
            }
        self.client = boto3.client(
            service,
            region_name=region_name or settings.aws_region,
            **creds,
            **kwargs,
        )
