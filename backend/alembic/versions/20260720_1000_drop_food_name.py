"""Drop food_name column from sensor_readings

Revision ID: drop_food_name
Revises: add_user_role_v2
Create Date: 2026-07-20 10:00:00.000000

System only classifies LAYAK/TIDAK LAYAK from gas + environmental sensors — no food identity is tracked.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'drop_food_name'
down_revision: Union[str, None] = 'add_user_role_v2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('sensor_readings', 'food_name')


def downgrade() -> None:
    op.add_column(
        'sensor_readings',
        sa.Column('food_name', sa.String(length=150), nullable=True),
    )
