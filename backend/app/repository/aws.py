import boto3

from app.config import settings


class AWSRepo:
    def __init__(self, service: str, region_name: str | None = None, **kwargs):
        self.client = boto3.client(
            service,
            region_name=region_name or settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            **kwargs,
        )
