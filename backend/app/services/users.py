# app/services/users.py
from app.exceptions.auth import TokenVerificationError, UnknownSubjectError
from app.exceptions.users import UserNotFoundError
from app.models import User
from app.models.user import UserRole
from app.repository.user import UserRepo
from app.schemas.users import Admin, Employee, UserBase, UserProfile


async def read_user_by_claims(user_repo: UserRepo, claims: dict) -> User:
    """Resolve the local user a verified token's claims point at.

    Translates the repo's 404 into a 401, the same way services/documents.py
    translates S3ObjectNotFoundError into DocumentNotFoundError: the repo
    speaks in data terms, the auth path speaks in credential terms.

    Raises:
        TokenVerificationError: the token carries no subject claim.
        UnknownSubjectError: the subject has no local user row.
    """
    cognito_sub = claims.get("sub")
    if not cognito_sub:
        raise TokenVerificationError("Token missing subject")

    try:
        return await user_repo.read_by_cognito_sub(cognito_sub)
    except UserNotFoundError as e:
        raise UnknownSubjectError("No local user for this token") from e


def to_user_base(user: User) -> UserBase:
    if user.role == UserRole.ADMIN:
        if user.department is None:
            raise ValueError(f"Admin user {user.id} has no department set")
        return Admin(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            department=user.department,
        )
    return Employee(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
    )


def to_user_profile(user: User) -> UserProfile:
    base = to_user_base(user)
    return UserProfile(
        **base.model_dump(),
        phone_number=user.phone_number,
        leave_days=user.leave_days,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )
