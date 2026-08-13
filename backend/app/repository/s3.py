from app.config import settings
from app.repository.aws import AWSRepo


class S3Repo(AWSRepo):
    def __init__(self):
        super().__init__(
            "s3",
            region_name=settings.aws_region,
            endpoint_url=settings.cognito_endpoint_url,
        )
