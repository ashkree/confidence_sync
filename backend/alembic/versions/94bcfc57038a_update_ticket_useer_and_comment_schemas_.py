"""update ticket, useer, and comment schemas to include relationships.

Revision ID: 94bcfc57038a
Revises: bc5b09279cc9
Create Date: 2026-07-31 01:23:02.692429

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "94bcfc57038a"
down_revision: str | Sequence[str] | None = "bc5b09279cc9"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("ticket_comments", sa.Column("body", sa.Text(), nullable=True))
    op.execute("UPDATE ticket_comments SET body = subject")
    op.alter_column("ticket_comments", "body", nullable=False)
    op.drop_column("ticket_comments", "subject")


def downgrade() -> None:
    op.add_column("ticket_comments", sa.Column("subject", sa.Text(), nullable=True))
    op.execute("UPDATE ticket_comments SET subject = body")
    op.alter_column("ticket_comments", "subject", nullable=False)
    op.drop_column("ticket_comments", "body")
