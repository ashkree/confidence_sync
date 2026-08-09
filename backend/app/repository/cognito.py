import base64
import hashlib
import hmac

import boto3
from botocore.exceptions import ClientError

from app.config import settings
from app.exceptions.auth import (
    AccountNotConfirmedError,
    AuthServiceUnavailableError,
    InvalidCredentialsError,
)


class CognitoRepo:
    def __init__(self):
        self.client = boto3.client(
            "cognito-idp",
            region_name=settings.aws_region,
            endpoint_url=settings.cognito_endpoint_url,
        )

    def _calculate_hash(self, username: str, client_id: str, client_secret: str) -> str:
        message = bytes(username + client_id, "utf-8")
        key = bytes(client_secret, "utf-8")
        digest = hmac.new(key, message, digestmod=hashlib.sha256).digest()
        return base64.b64encode(digest).decode()

    async def login_user(self, username: str, password: str) -> dict:
        try:
            client_id = settings.cognito_app_client_id
            client_secret = settings.cognito_app_client_secret
            response = self.client.initiate_auth(
                ClientId=client_id,
                AuthFlow="USER_PASSWORD_AUTH",
                AuthParameters={
                    "USERNAME": username,
                    "PASSWORD": password,
                    "SECRET_HASH": self._calculate_hash(
                        username, client_id, client_secret
                    ),
                },
            )
        except self.client.exceptions.NotAuthorizedException:
            raise InvalidCredentialsError()
        except self.client.exceptions.UserNotFoundException:
            raise InvalidCredentialsError()
        except self.client.exceptions.UserNotConfirmedException:
            raise AccountNotConfirmedError()
        except ClientError as e:
            raise AuthServiceUnavailableError() from e

        return response["AuthenticationResult"]

    async def refresh_token(self, username: str, refresh_token: str) -> dict:
        try:
            client_id = settings.cognito_app_client_id
            client_secret = settings.cognito_app_client_secret
            response = self.client.initiate_auth(
                ClientId=client_id,
                AuthFlow="REFRESH_TOKEN_AUTH",
                AuthParameters={
                    "REFRESH_TOKEN": refresh_token,
                    "SECRET_HASH": self._calculate_hash(
                        username, client_id, client_secret
                    ),
                },
            )
        except self.client.exceptions.NotAuthorizedException:
            raise InvalidCredentialsError()
        except self.client.exceptions.UserNotFoundException:
            raise InvalidCredentialsError()
        except ClientError as e:
            raise AuthServiceUnavailableError() from e

        return response["AuthenticationResult"]
