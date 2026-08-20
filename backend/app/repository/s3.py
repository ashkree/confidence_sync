from app.config import settings
from app.repository.aws import AWSRepo


class S3Repo(AWSRepo):
    def __init__(self):
        super().__init__(
            "s3",
            region_name=settings.aws_region,
            endpoint_url=settings.s3_endpoint_url,
        )

    def upload_file(
        self,
        file_obj,
        bucket_name: str,
        object_key: str,
        extra_args: dict | None = None,
    ):
        merged_extra_args = {"ContentType": "application/pdf"}
        if extra_args:
            merged_extra_args.update(extra_args)

        self.client.upload_fileobj(
            file_obj,
            bucket_name,
            object_key,
            ExtraArgs=merged_extra_args,
        )

    def download_file(self, bucket_name: str, object_name: str):
        response = self.client.get_object(Bucket=bucket_name, Key=object_name)
        return response["Body"]
