"""Seed real Cognito and RDS with matching users.

Unlike scripts/seed_local.py, this provisions nothing. CloudFormation owns the
user pool and app client; this script only creates users inside them. If the
pool id in .env is wrong, admin_create_user fails loudly rather than quietly
building a second pool outside the stack.

Must run on the EC2 instance — RDS sits in a private subnet and is not
reachable from anywhere else.

    docker run --rm \
      --env-file /home/ec2-user/.env \
      -e SEED_CONFIRM=yes \
      -e SEED_PASSWORD='Testing12345!' \
      confidence-sync-backend \
      python -m scripts.seed_prod

Idempotent: re-running updates existing rows rather than failing.

IAM actions needed by BackendRole: AdminCreateUser, AdminSetUserPassword,
AdminGetUser. No Describe* or Create* — this script never inspects or builds
infrastructure.
"""

import asyncio
import os
import sys
import uuid

from sqlalchemy import select

from app.config import settings
from app.database import AsyncSessionLocal
from app.models import User
from app.models.user import UserDepartment, UserRole
from app.repository.aws import AWSRepo

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


def preflight() -> str:
    """Fail before touching anything if the environment looks wrong."""

    if os.environ.get("SEED_CONFIRM") != "yes":
        sys.exit(
            "Refusing to run: this writes to real Cognito and RDS.\n"
            "Set SEED_CONFIRM=yes if that is what you want."
        )

    if settings.use_cognito_local:
        sys.exit(
            "USE_COGNITO_LOCAL is true. Use scripts/seed_local.py instead, "
            "or fix the environment before running this."
        )

    password = os.environ.get("SEED_PASSWORD")
    if not password:
        sys.exit("SEED_PASSWORD is not set.")

    # Mirrors the PasswordPolicy on the CloudFormation user pool. Checking
    # here gives a readable message instead of InvalidPasswordException
    # partway through the loop, with some users already created.
    problems = []
    if len(password) < 12:
        problems.append("at least 12 characters")
    if not any(c.isupper() for c in password):
        problems.append("an uppercase letter")
    if not any(c.islower() for c in password):
        problems.append("a lowercase letter")
    if not any(c.isdigit() for c in password):
        problems.append("a digit")
    if password.isalnum():
        problems.append("a symbol")
    if problems:
        sys.exit("SEED_PASSWORD needs " + ", ".join(problems) + ".")

    if not settings.cognito_user_pool_id:
        sys.exit("COGNITO_USER_POOL_ID is not set.")

    return password


def ensure_cognito_user(cognito, pool_id: str, email: str, password: str) -> str:
    """Create the Cognito user if absent and return its sub."""

    try:
        cognito.admin_create_user(
            UserPoolId=pool_id,
            Username=email,
            UserAttributes=[
                {"Name": "email", "Value": email},
                {"Name": "email_verified", "Value": "true"},
            ],
            # SUPPRESS stops Cognito emailing a temporary password to an
            # address that does not exist.
            MessageAction="SUPPRESS",
        )
    except cognito.exceptions.UsernameExistsException:
        pass

    # Without Permanent=True the user sits in FORCE_CHANGE_PASSWORD and
    # initiate_auth returns a challenge instead of tokens.
    cognito.admin_set_user_password(
        UserPoolId=pool_id, Username=email, Password=password, Permanent=True
    )

    details = cognito.admin_get_user(UserPoolId=pool_id, Username=email)
    for attribute in details["UserAttributes"]:
        if attribute["Name"] == "sub":
            return attribute["Value"]

    raise RuntimeError(f"No sub attribute returned for {email}")


async def upsert_user(session, spec: dict, cognito_sub: str) -> None:
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
    password = preflight()

    pool_id = settings.cognito_user_pool_id
    cognito = AWSRepo("cognito-idp").client

    print(f"Pool: {pool_id}\n")

    print("Cognito users:")
    subs: dict[str, str] = {}
    for spec in SEED_USERS:
        subs[spec["email"]] = ensure_cognito_user(
            cognito, pool_id, spec["email"], password
        )
        print(f"  {spec['email']} -> {subs[spec['email']]}")

    print("\nPostgres rows:")
    async with AsyncSessionLocal() as session:
        for spec in SEED_USERS:
            await upsert_user(session, spec, subs[spec["email"]])
            print(f"  {spec['email']}")
        await session.commit()

    print(f"\nDone. {len(SEED_USERS)} users seeded.")
    print("These are test accounts on a publicly reachable deployment.")
    print("Change or remove them before sharing the URL.")


if __name__ == "__main__":
    asyncio.run(main())
