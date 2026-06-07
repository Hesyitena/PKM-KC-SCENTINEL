"""drop user role column

Revision ID: drop_user_role_col
Revises: 2b7c4563cdb5
Create Date: 2026-06-07 21:40:00.000000

Simplify authentication: remove role-based access control.
All users are equal — only username + password is needed.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'drop_user_role_col'
down_revision: Union[str, None] = '2b7c4563cdb5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the role column from users table
    op.drop_column('users', 'role')
    # Drop the userrole enum type from PostgreSQL
    op.execute("DROP TYPE IF EXISTS userrole")


def downgrade() -> None:
    # Re-create the enum type
    op.execute("CREATE TYPE userrole AS ENUM ('ADMIN', 'VIEWER')")
    # Re-add the role column (default VIEWER for existing rows)
    op.add_column(
        'users',
        sa.Column(
            'role',
            sa.Enum('ADMIN', 'VIEWER', name='userrole'),
            nullable=False,
            server_default='VIEWER',
        )
    )
