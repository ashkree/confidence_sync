# app/services/documents.py
from typing import Literal

from app.models import User
from app.models.user import UserDepartment, UserRole

DocumentCategory = Literal["HR_POLICY", "IT_MANUAL"]


def get_document_categories_for_user(user: User) -> list[DocumentCategory]:
    """Return the document categories visible to the given user.

    - EMPLOYEE: sees all categories (HR policies and IT manuals).
    - ADMIN (IT): sees only IT manuals.
    - ADMIN (HR): sees only HR policies.
    """
    if user.role == UserRole.EMPLOYEE:
        return ["HR_POLICY", "IT_MANUAL"]

    if user.department == UserDepartment.IT:
        return ["IT_MANUAL"]

    if user.department == UserDepartment.HR:
        return ["HR_POLICY"]

    # Fallback: no documents visible (e.g. admin with no department set)
    return []
