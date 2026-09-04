"""renames message role HUMAN to USER to match bedrock calls

Revision ID: 87293d0c30dc
Revises: 593e8f7dab2d
Create Date: 2026-09-02 20:47:54.313651

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "87293d0c30dc"
down_revision: Union[str, Sequence[str], None] = "593e8f7dab2d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        ALTER TYPE message_role
        RENAME VALUE 'HUMAN' TO 'USER'
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TYPE message_role
        RENAME VALUE 'USER' TO 'HUMAN'
    """)
