# Security Verification Checklist

- [x] Security headers middleware checks all 8 items.
- [x] Rate limiting configured on insights and schedulings.
- [x] RegEx filters strip phone numbers and emails out of prompts.
- [x] Firestore security rules block unauthorized updates.
- [x] Dependency audit scans (bandit, pip-audit) configured in workflows.
