"""Seed cognito-local and Postgres with matching test users.

Run from inside the backend container so that COGNITO_ENDPOINT_URL and DB_URL
resolve to the compose service names:

    docker compose exec backend python -m scripts.seed_local

Idempotent: re-running updates existing rows rather than failing.

If the pool or client named in .env doesn't exist, this creates new ones and
prints their ids. Those MUST be copied into .env before the backend will work,
because get_issuer() builds the expected `iss` claim from the pool id — a
mismatch surfaces as "Token issuer does not match this user pool", which reads
like a signing bug rather than a config one.
"""

import asyncio
import uuid

from botocore.exceptions import ClientError
from sqlalchemy import select

from app.config import settings
from app.database import AsyncSessionLocal
from app.models import User
from app.models.user import UserDepartment, UserRole
from app.repository.aws import AWSRepo

PASSWORD = "Passw0rd!"

# Mirrors frontend/src/mocks/users.json so mock mode and the real backend
# present the same identities.
SEED_USERS = [
    {
        "name": "Employee One",
        "email": "employee_0@example.com",
        "phone_number": "+15551000001",
        "leave_days": 14,
        "role": UserRole.EMPLOYEE,
        "department": None,
    },
    {
        "name": "Employee Two",
        "email": "employee_1@example.com",
        "phone_number": "+15551000002",
        "leave_days": 10,
        "role": UserRole.EMPLOYEE,
        "department": None,
    },
    {
        "name": "HR Admin One",
        "email": "hr_admin@example.com",
        "phone_number": "+15552000001",
        "leave_days": 18,
        "role": UserRole.ADMIN,
        "department": UserDepartment.HR,
    },
    {
        "name": "IT Admin One",
        "email": "it_admin@example.com",
        "phone_number": "+15553000001",
        "leave_days": 16,
        "role": UserRole.ADMIN,
        "department": UserDepartment.IT,
    },
]


def _client():
    return AWSRepo("cognito-idp", endpoint_url=settings.cognito_endpoint_url).client


def ensure_pool(cognito) -> tuple[str, bool]:
    """Return (pool_id, created). Reuses the configured pool if it exists."""
    pool_id = settings.cognito_user_pool_id
    if pool_id:
        try:
            cognito.describe_user_pool(UserPoolId=pool_id)
            print(f"  pool {pool_id} (existing)")
            return pool_id, False
        except ClientError:
            print(f"  pool {pool_id} not found, creating a new one")

    response = cognito.create_user_pool(
        PoolName="confidence-sync",
        UsernameAttributes=["email"],
        AutoVerifiedAttributes=["email"],
    )
    new_id = response["UserPool"]["Id"]
    print(f"  pool {new_id} (created)")
    return new_id, True


def ensure_client(cognito, pool_id: str) -> tuple[str, str | None, bool]:
    """Return (client_id, client_secret, created).

    The secret is only returned by create_user_pool_client, so on the reuse
    path it comes back as None and whatever is already in .env still applies.
    """
    client_id = settings.cognito_app_client_id
    if client_id:
        try:
            cognito.describe_user_pool_client(UserPoolId=pool_id, ClientId=client_id)
            print(f"  client {client_id} (existing)")
            return client_id, None, False
        except ClientError:
            print(f"  client {client_id} not found, creating a new one")

    response = cognito.create_user_pool_client(
        UserPoolId=pool_id,
        ClientName="web",
        # GenerateSecret because CognitoRepo._calculate_hash sends SECRET_HASH
        # on every call — a secretless client would reject those requests.
        GenerateSecret=True,
        ExplicitAuthFlows=["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"],
    )
    created = response["UserPoolClient"]
    print(f"  client {created['ClientId']} (created)")
    return created["ClientId"], created.get("ClientSecret"), True


def ensure_cognito_user(cognito, pool_id: str, email: str) -> str:
    """Create the Cognito user if absent and return its sub."""
    try:
        cognito.admin_create_user(
            UserPoolId=pool_id,
            Username=email,
            UserAttributes=[
                {"Name": "email", "Value": email},
                {"Name": "email_verified", "Value": "true"},
            ],
            MessageAction="SUPPRESS",
        )
    except cognito.exceptions.UsernameExistsException:
        pass

    # Without --permanent the user sits in FORCE_CHANGE_PASSWORD and login
    # returns a challenge instead of tokens, which _to_auth_result can't parse.
    cognito.admin_set_user_password(
        UserPoolId=pool_id, Username=email, Password=PASSWORD, Permanent=True
    )

    details = cognito.admin_get_user(UserPoolId=pool_id, Username=email)
    for attribute in details["UserAttributes"]:
        if attribute["Name"] == "sub":
            return attribute["Value"]

    raise RuntimeError(f"No sub attribute returned for {email}")


async def upsert_local_user(session, spec: dict, cognito_sub: str) -> None:
    """Insert or update the Postgres row keyed on email."""
    user = await session.scalar(select(User).where(User.email == spec["email"]))

    if user is None:
        user = User(email=spec["email"])
        session.add(user)

    user.name = spec["name"]
    user.cognito_sub = uuid.UUID(cognito_sub)
    user.role = spec["role"]
    user.department = spec["department"]
    user.phone_number = spec["phone_number"]
    user.leave_days = spec["leave_days"]


async def main() -> None:
    if not settings.use_cognito_local:
        raise SystemExit("Refusing to run: USE_COGNITO_LOCAL is false.")

    cognito = _client()

    print("Cognito:")
    pool_id, pool_created = ensure_pool(cognito)
    client_id, client_secret, client_created = ensure_client(cognito, pool_id)

    print("\nUsers:")
    subs: dict[str, str] = {}
    for spec in SEED_USERS:
        subs[spec["email"]] = ensure_cognito_user(cognito, pool_id, spec["email"])
        print(f"  {spec['email']} -> {subs[spec['email']]}")

    async with AsyncSessionLocal() as session:
        for spec in SEED_USERS:
            await upsert_local_user(session, spec, subs[spec["email"]])
        await session.commit()

    print(f"\nDone. Password for every seeded user: {PASSWORD}")

    if pool_created or client_created:
        print("\n" + "=" * 60)
        print("UPDATE .env AND RESTART THE BACKEND:")
        print(f"  COGNITO_USER_POOL_ID={pool_id}")
        print(f"  COGNITO_APP_CLIENT_ID={client_id}")
        if client_secret:
            print(f"  COGNITO_APP_CLIENT_SECRET={client_secret}")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
