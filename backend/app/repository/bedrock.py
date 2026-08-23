from app.config import settings
from app.repository.aws import AWSRepo


class BedrockRepo(AWSRepo):
    def __init__(self):
        super().__init__(
            "bedrock-runtime",
            region_name=settings.aws_region,
            endpoint_url=settings.bedrock_endpoint_url,
        )


if __name__ == "__main__":
    bedrockRepo = BedrockRepo()

    try:
        response = bedrockRepo.client.converse(
            modelId="anthropic.claude-3-haiku-20240307-v1:0",
            messages=[
                {
                    "role": "user",
                    "content": [{"text": "If a woodchuck could chuck wood"}],
                }
            ],
        )

        print(response)
    except Exception as e:
        # botocore will raise on anything that doesn't look like a valid
        # response shape (missing fields, wrong types, bad JSON) — the
        # exception message is usually exactly what's mismatched.
        print(f"❌ boto3 rejected the response: {e}")
        raise
