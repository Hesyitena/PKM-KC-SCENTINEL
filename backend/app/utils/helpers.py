"""
SCENTINEL - Helper Utilities
General-purpose helper functions.
"""
from datetime import datetime, timezone


def utcnow() -> datetime:
    """Return current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def format_confidence(confidence: float) -> str:
    """Format confidence float to percentage string. E.g. 0.9234 → '92.34%'"""
    return f"{confidence * 100:.2f}%"


def truncate_string(s: str, max_length: int = 50) -> str:
    """Truncate string to max_length with ellipsis."""
    if len(s) <= max_length:
        return s
    return s[:max_length - 3] + "..."
