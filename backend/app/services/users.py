from app.models import User
from app.models.user import UserRole
from app.schemas.users import Admin, Employee, UserBase, UserProfile


def to_user_base(user: User) -> UserBase:
    if user.role == UserRole.ADMIN:
        if user.department is None:
            raise ValueError(f"Admin user {user.id} has no department set")
        return Admin(
            name=user.name,
            email=user.email,
            role=user.role.value,
            department=user.department.value,
        )
    return Employee(
        name=user.name,
        email=user.email,
        role=user.role.value,
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
