"""Uppercase all enum values in the database.

Revision ID: a1b2c3d4e5f6
Revises: 94bcfc57038a
Create Date: 2026-08-09 12:54:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: str | Sequence[str] | None = "68c56ed90c1b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# ---------------------------------------------------------------------------
# Helpers — cast column to TEXT, do the UPPER() update, then cast back to the
# new enum type.  PostgreSQL requires this because you cannot UPDATE an enum
# column whose type is about to change while the old type still restricts it.
# ---------------------------------------------------------------------------

OLD_USER_ROLE_VALUES = ("employee", "admin")
NEW_USER_ROLE_VALUES = ("EMPLOYEE", "ADMIN")

OLD_USER_DEPT_VALUES = ("hr", "it")
NEW_USER_DEPT_VALUES = ("HR", "IT")

OLD_TICKET_TYPE_VALUES = ("hr_request", "it_ticket")
NEW_TICKET_TYPE_VALUES = ("HR_REQUEST", "IT_TICKET")

OLD_TICKET_STATUS_VALUES = ("open", "pending", "resolved", "closed")
NEW_TICKET_STATUS_VALUES = ("OPEN", "PENDING", "RESOLVED", "CLOSED")

OLD_TICKET_PRIORITY_VALUES = ("high", "medium", "low")
NEW_TICKET_PRIORITY_VALUES = ("HIGH", "MEDIUM", "LOW")

OLD_HR_REQUEST_TYPE_VALUES = ("leave_request", "document_request")
NEW_HR_REQUEST_TYPE_VALUES = ("LEAVE_REQUEST", "DOCUMENT_REQUEST")

OLD_DOCUMENT_TYPE_VALUES = ("noc", "salary_certificate")
NEW_DOCUMENT_TYPE_VALUES = ("NOC", "SALARY_CERTIFICATE")

OLD_IT_REQUEST_TYPE_VALUES = ("hardware_issue", "software_issue")
NEW_IT_REQUEST_TYPE_VALUES = ("HARDWARE_ISSUE", "SOFTWARE_ISSUE")


def _upgrade_enum(
    table: str,
    column: str,
    enum_name: str,
    old_values: tuple,
    new_values: tuple,
) -> None:
    """
    Rename every enum value in `old_values` to its counterpart in `new_values`.
    Strategy:
      1. Cast the column to TEXT so the old enum type no longer constrains it.
      2. UPPER() the text values.
      3. Drop the old PostgreSQL enum type (ALTER TYPE ... RENAME VALUE requires
         PG >= 10; using DROP + CREATE is cleaner and more portable).
      4. Create the new enum type with UPPERCASE values.
      5. Cast the column back to the new enum type.
    """
    connection = op.get_bind()

    # 1. Cast column to TEXT
    op.alter_column(
        table,
        column,
        type_=sa.Text(),
        existing_type=postgresql.ENUM(*old_values, name=enum_name),
        postgresql_using=f'"{column}"::text',
    )

    # 2. Uppercase the values
    connection.execute(
        sa.text(f'UPDATE "{table}" SET "{column}" = UPPER("{column}")')
    )

    # 3. Drop old enum type
    postgresql.ENUM(*old_values, name=enum_name).drop(connection, checkfirst=True)

    # 4. Create new enum type with UPPERCASE values
    new_enum = postgresql.ENUM(*new_values, name=enum_name)
    new_enum.create(connection, checkfirst=True)

    # 5. Cast column back to new enum type
    op.alter_column(
        table,
        column,
        type_=new_enum,
        existing_type=sa.Text(),
        postgresql_using=f'"{column}"::{enum_name}',
    )


def _downgrade_enum(
    table: str,
    column: str,
    enum_name: str,
    old_values: tuple,   # the UPPERCASE values currently in the DB
    new_values: tuple,   # the lowercase values to restore
) -> None:
    connection = op.get_bind()

    op.alter_column(
        table,
        column,
        type_=sa.Text(),
        existing_type=postgresql.ENUM(*old_values, name=enum_name),
        postgresql_using=f'"{column}"::text',
    )

    connection.execute(
        sa.text(f'UPDATE "{table}" SET "{column}" = LOWER("{column}")')
    )

    postgresql.ENUM(*old_values, name=enum_name).drop(connection, checkfirst=True)

    restored_enum = postgresql.ENUM(*new_values, name=enum_name)
    restored_enum.create(connection, checkfirst=True)

    op.alter_column(
        table,
        column,
        type_=restored_enum,
        existing_type=sa.Text(),
        postgresql_using=f'"{column}"::{enum_name}',
    )


def upgrade() -> None:
    # users table
    _upgrade_enum("users", "role", "user_role", OLD_USER_ROLE_VALUES, NEW_USER_ROLE_VALUES)
    _upgrade_enum("users", "department", "user_department", OLD_USER_DEPT_VALUES, NEW_USER_DEPT_VALUES)

    # tickets table (type is the polymorphic discriminator — must be updated too)
    _upgrade_enum("tickets", "type", "ticket_type", OLD_TICKET_TYPE_VALUES, NEW_TICKET_TYPE_VALUES)
    _upgrade_enum("tickets", "status", "ticket_status", OLD_TICKET_STATUS_VALUES, NEW_TICKET_STATUS_VALUES)
    _upgrade_enum("tickets", "priority", "ticket_priority", OLD_TICKET_PRIORITY_VALUES, NEW_TICKET_PRIORITY_VALUES)

    # hr_requests table
    _upgrade_enum("hr_requests", "request_type", "request_type", OLD_HR_REQUEST_TYPE_VALUES, NEW_HR_REQUEST_TYPE_VALUES)
    _upgrade_enum("hr_requests", "document_type", "document_type", OLD_DOCUMENT_TYPE_VALUES, NEW_DOCUMENT_TYPE_VALUES)

    # it_tickets table
    _upgrade_enum("it_tickets", "request_type", "it_request_type", OLD_IT_REQUEST_TYPE_VALUES, NEW_IT_REQUEST_TYPE_VALUES)


def downgrade() -> None:
    # Reverse all changes (UPPERCASE → lowercase)
    _downgrade_enum("it_tickets", "request_type", "it_request_type", NEW_IT_REQUEST_TYPE_VALUES, OLD_IT_REQUEST_TYPE_VALUES)
    _downgrade_enum("hr_requests", "document_type", "document_type", NEW_DOCUMENT_TYPE_VALUES, OLD_DOCUMENT_TYPE_VALUES)
    _downgrade_enum("hr_requests", "request_type", "request_type", NEW_HR_REQUEST_TYPE_VALUES, OLD_HR_REQUEST_TYPE_VALUES)
    _downgrade_enum("tickets", "priority", "ticket_priority", NEW_TICKET_PRIORITY_VALUES, OLD_TICKET_PRIORITY_VALUES)
    _downgrade_enum("tickets", "status", "ticket_status", NEW_TICKET_STATUS_VALUES, OLD_TICKET_STATUS_VALUES)
    _downgrade_enum("tickets", "type", "ticket_type", NEW_TICKET_TYPE_VALUES, OLD_TICKET_TYPE_VALUES)
    _downgrade_enum("users", "department", "user_department", NEW_USER_DEPT_VALUES, OLD_USER_DEPT_VALUES)
    _downgrade_enum("users", "role", "user_role", NEW_USER_ROLE_VALUES, OLD_USER_ROLE_VALUES)
