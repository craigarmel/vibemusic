from datetime import datetime, timezone
from typing import Any

artists: dict[str, Any] = {}
sessions: dict[str, Any] = {}
tracks: dict[str, Any] = {}
clips: list[dict[str, Any]] = []
influences: list[dict[str, Any]] = []
tasks: dict[str, Any] = {}


def utc_now() -> datetime:
    return datetime.now(tz=timezone.utc)
