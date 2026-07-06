"""Pure functions for Multi-Language auto-detection and language code mappings.

Zero side-effects for testing.
"""

SUPPORTED_LANGUAGES: dict[str, str] = {
    "en": "English",
    "hi": "Hindi",
    "es": "Spanish",
    "fr": "French",
    "ar": "Arabic",
}

# Heuristics detection patterns for offline operations
LANGUAGE_HEURISTICS: list[tuple[str, str]] = [
    ("namaste", "hi"),
    ("kya", "hi"),
    ("donde", "es"),
    ("gracias", "es"),
    ("hola", "es"),
    ("bonjour", "fr"),
    ("merci", "fr"),
    ("s'il vous plait", "fr"),
    ("marhaba", "ar"),
    ("shukran", "ar"),
]


def detect_query_language(query: str, fallback_lang: str = "en") -> str:
    """Detect language of a query string using simple heuristics.

    Defaults to fallback_lang if no heuristics match.
    """
    cleaned_query = query.lower().strip()
    for word, lang_code in LANGUAGE_HEURISTICS:
        if word in cleaned_query:
            return lang_code
    return fallback_lang
