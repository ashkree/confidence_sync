import asyncio
from functools import lru_cache

from botocore.exceptions import BotoCoreError, ClientError

from app.config import settings
from app.exceptions.external import S3ObjectNotFoundError, S3UnavailableError
from app.repository.aws import AWSRepo


class S3Repo(AWSRepo):
    def __init__(self):
        super().__init__(
            "s3",
            region_name=settings.aws_region,
            endpoint_url=settings.s3_endpoint_url,
        )

    async def upload_file(
        self,
        file_obj,
        bucket_name: str,
        object_key: str,
        extra_args: dict | None = None,
    ):
        await asyncio.to_thread(
            self._upload_file, file_obj, bucket_name, object_key, extra_args
        )

    async def download_file(self, bucket_name: str, object_name: str):
        return await asyncio.to_thread(self._download_file, bucket_name, object_name)

    def _upload_file(self, file_obj, bucket_name, object_key, extra_args=None):
        merged_extra_args = {"ContentType": "application/pdf"}
        if extra_args:
            merged_extra_args.update(extra_args)
        try:
            self.client.upload_fileobj(
                file_obj, bucket_name, object_key, ExtraArgs=merged_extra_args
            )
        except (ClientError, BotoCoreError) as e:
            raise S3UnavailableError(f"S3 upload failed: {e}") from e

    def _download_file(self, bucket_name: str, object_name: str):
        try:
            response = self.client.get_object(Bucket=bucket_name, Key=object_name)
        except self.client.exceptions.NoSuchKey as e:
            raise S3ObjectNotFoundError(
                f"S3 object not found: {bucket_name}/{object_name}"
            ) from e
        except (ClientError, BotoCoreError) as e:
            raise S3UnavailableError(f"S3 download failed: {e}") from e
        return response["Body"]


@lru_cache
def get_s3_client() -> S3Repo:
    return S3Repo()
