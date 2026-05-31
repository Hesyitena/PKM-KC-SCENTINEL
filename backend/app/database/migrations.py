"""
SCENTINEL - Database Migrations Helper
Convenience wrapper around Alembic CLI for common operations.
Used during development; production should use `alembic upgrade head` directly.
"""
import subprocess
import sys


def run_migrations():
    """Run all pending Alembic migrations."""
    subprocess.run(["alembic", "upgrade", "head"], check=True)


def create_migration(message: str):
    """Auto-generate a new Alembic migration from model changes."""
    subprocess.run(
        ["alembic", "revision", "--autogenerate", "-m", message], check=True
    )


def downgrade(revision: str = "-1"):
    """Roll back one (or more) migrations."""
    subprocess.run(["alembic", "downgrade", revision], check=True)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "upgrade"
    if cmd == "upgrade":
        run_migrations()
    elif cmd == "create" and len(sys.argv) > 2:
        create_migration(sys.argv[2])
    elif cmd == "downgrade":
        rev = sys.argv[2] if len(sys.argv) > 2 else "-1"
        downgrade(rev)
    else:
        print("Usage: python -m app.database.migrations [upgrade|create <msg>|downgrade [rev]]")
