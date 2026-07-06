# Security Architecture

## 1. Network Perimeter & Traffic Headers
All endpoints are behind an ASGI security middleware that enforces Strict-Transport-Security, CSP policies, Referrer headers, and Permissions profiles.

## 2. PII Safety & Vertex AI Sanitizer
Vertex AI inputs pass through regex pattern checkers that redact credit card/email/phone markers before payload delivery.
