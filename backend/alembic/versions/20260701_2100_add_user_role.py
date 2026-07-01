"""Add role column to users table

Revision ID: add_user_role_v2
Revises: 20a2df29c5a5
Create Date: 2026-07-01 21:00:00.000000

Re-introduce RBAC: ADMIN gets full dashboard, VIEWER gets fullscreen monitoring only.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_user_role_v2'
down_revision: Union[str, None] = '20a2df29c5a5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the enum type
    op.execute("CREATE TYPE userrole AS ENUM ('ADMIN', 'VIEWER')")
    # Add role column — existing rows (i.e. admin) default to ADMIN
    op.add_column(
        'users',
        sa.Column(
            'role',
            sa.Enum('ADMIN', 'VIEWER', name='userrole'),
            nullable=False,
            server_default='ADMIN',
        )
    )


def downgrade() -> None:
    op.drop_column('users', 'role')
    op.execute("DROP TYPE IF EXISTS userrole")
