"""PII protection and prompt sanitization.

Redacts phone numbers and email addresses from free-text before
sending to Gemini. Also strips control characters and enforces
maximum prompt length.
"""

import re

PHONE_PATTERN: re.Pattern[str] = re.compile(r"\b\d{10}\b|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b")
EMAIL_PATTERN: re.Pattern[str] = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")


def redact_pii(text: str) -> str:
    """Replace phone numbers and email addresses with redaction markers."""
    text = PHONE_PATTERN.sub("[PHONE_REDACTED]", text)
    return EMAIL_PATTERN.sub("[EMAIL_REDACTED]", text)


def sanitize_for_prompt(value: str, max_length: int = 500) -> str:
    """Clean and truncate user input before sending to Gemini.

    1. Strip control characters (0x00-0x1f, 0x7f)
    2. Redact PII (phone/email)
    3. Truncate to max_length
    """
    cleaned = re.sub(r"[\x00-\x1f\x7f]", "", value)
    return redact_pii(cleaned)[:max_length]
