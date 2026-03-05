from __future__ import annotations

from collections.abc import Callable
from functools import wraps
from typing import Any

from cachetools import TTLCache

_caches: dict[int, TTLCache] = {}


def cached(ttl_seconds: int = 600) -> Callable:
    if ttl_seconds not in _caches:
        _caches[ttl_seconds] = TTLCache(maxsize=256, ttl=ttl_seconds)
    cache = _caches[ttl_seconds]

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            key = (func.__name__, args, tuple(sorted(kwargs.items())))
            if key in cache:
                return cache[key]
            value = func(*args, **kwargs)
            cache[key] = value
            return value

        return wrapper

    return decorator
