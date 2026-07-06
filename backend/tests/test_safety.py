"""Tests for PII safety — redaction verified."""

import pytest

from app.core.safety import redact_pii, sanitize_for_prompt


class TestRedactPii:
    """Tests for PII redaction."""

    def test_redacts_10_digit_phone(self):
        result = redact_pii("Call me at 1234567890")
        assert "[PHONE_REDACTED]" in result
        assert "1234567890" not in result

    def test_redacts_formatted_phone_dash(self):
        result = redact_pii("Phone: 123-456-7890")
        assert "[PHONE_REDACTED]" in result
        assert "123-456-7890" not in result

    def test_redacts_formatted_phone_dot(self):
        result = redact_pii("Phone: 123.456.7890")
        assert "[PHONE_REDACTED]" in result

    def test_redacts_formatted_phone_space(self):
        result = redact_pii("Phone: 123 456 7890")
        assert "[PHONE_REDACTED]" in result

    def test_redacts_email(self):
        result = redact_pii("Email: user@example.com")
        assert "[EMAIL_REDACTED]" in result
        assert "user@example.com" not in result

    def test_redacts_complex_email(self):
        result = redact_pii("Contact john.doe+tag@sub.domain.co.uk")
        assert "[EMAIL_REDACTED]" in result

    def test_preserves_normal_text(self):
        text = "The stadium capacity is 60000 people"
        assert redact_pii(text) == text

    def test_redacts_multiple_pii(self):
        text = "Call 1234567890 or email test@test.com"
        result = redact_pii(text)
        assert "[PHONE_REDACTED]" in result
        assert "[EMAIL_REDACTED]" in result


class TestSanitizeForPrompt:
    """Tests for prompt sanitization."""

    def test_strips_control_characters(self):
        result = sanitize_for_prompt("Hello\x00World\x1f!")
        assert "\x00" not in result
        assert "\x1f" not in result
        assert "HelloWorld!" in result

    def test_truncates_to_max_length(self):
        long_text = "a" * 1000
        result = sanitize_for_prompt(long_text, max_length=500)
        assert len(result) == 500

    def test_default_max_length(self):
        long_text = "b" * 1000
        result = sanitize_for_prompt(long_text)
        assert len(result) == 500

    def test_custom_max_length(self):
        result = sanitize_for_prompt("hello world", max_length=5)
        assert len(result) == 5

    def test_combined_sanitization(self):
        text = "Call 1234567890\x00 or email test@test.com"
        result = sanitize_for_prompt(text)
        assert "[PHONE_REDACTED]" in result
        assert "[EMAIL_REDACTED]" in result
        assert "\x00" not in result

    def test_empty_string(self):
        assert sanitize_for_prompt("") == ""

    def test_preserves_normal_characters(self):
        text = "Normal text with numbers 42 and symbols #@!"
        # Note: # and ! won't match email/phone patterns
        result = sanitize_for_prompt(text)
        assert "Normal text" in result

    def test_preserves_non_ascii_multilingual(self):
        # Multilingual strings (Hindi/Spanish/Arabic)
        text = "नमस्ते / Hola / مرحبا"
        result = sanitize_for_prompt(text)
        assert "नमस्ते" in result
        assert "Hola" in result
        assert "مرحبا" in result


class TestGeminiServicePIISafety:
    """Tests verifying prompt-level sanitization inside the Gemini service."""

    @pytest.mark.asyncio
    async def test_generate_multilingual_assistance_sanitizes_pii(self):
        from unittest.mock import patch

        with patch("app.services.gemini_service.generate_insight") as mock_insight:
            mock_insight.return_value = {"response_text": "Clean", "detected_language": "en"}
            from app.services.gemini_service import generate_multilingual_assistance

            # Call with PII and control characters
            await generate_multilingual_assistance(
                query="My email is test@test.com\x00 and phone is 1234567890",
                preferred_language="es",
                persona_type="fan",
            )

            # Verify generate_insight was called with redacted and sanitized prompt
            mock_insight.assert_called_once()
            called_prompt = mock_insight.call_args[0][0]
            assert "[EMAIL_REDACTED]" in called_prompt
            assert "[PHONE_REDACTED]" in called_prompt
            assert "\x00" not in called_prompt
            assert "test@test.com" not in called_prompt
            assert "1234567890" not in called_prompt
