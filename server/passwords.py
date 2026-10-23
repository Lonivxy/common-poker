"""Ephemeral room passwords; only salted scrypt digests stay in memory."""
import hashlib
import secrets


def validate_password(password):
    if not isinstance(password, str) or len(password) > 64:
        raise ValueError("Password must be at most 64 characters")
    return password


def hash_password(password):
    validate_password(password)
    if not password: return None
    salt = secrets.token_bytes(16)
    return salt, hashlib.scrypt(password.encode("utf-8"), salt=salt, n=16384, r=8, p=1, dklen=32)


def check_password(password, stored):
    validate_password(password)
    if stored is None: return True
    salt, expected = stored
    actual = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=16384, r=8, p=1, dklen=32)
    return secrets.compare_digest(actual, expected)
