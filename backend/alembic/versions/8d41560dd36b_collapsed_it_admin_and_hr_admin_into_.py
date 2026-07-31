"""Collapsed IT_ADMIN and HR_ADMIN into just ADMIN

Revision ID: 8d41560dd36b
Revises: 94bcfc57038a
Create Date: 2026-07-31 13:40:11.311953
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "8d41560dd36b"
down_revision: Union[str, Sequence[str], None] = "94bcfc57038a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("users", "role")
    op.execute("DROP TYPE user_role")

    new_role_enum = sa.Enum("employee", "admin", name="user_role")
    new_role_enum.create(op.get_bind())

    op.add_column(
        "users",
        sa.Column(
            "role",
            new_role_enum,
            nullable=False,
            server_default="employee",
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "role")
    op.execute("DROP TYPE user_role")

    old_role_enum = sa.Enum("employee", "hr_admin", "it_admin", name="user_role")
    old_role_enum.create(op.get_bind())

    op.add_column(
        "users",
        sa.Column(
            "role",
            old_role_enum,
            nullable=False,
            server_default="employee",
        ),
    )
