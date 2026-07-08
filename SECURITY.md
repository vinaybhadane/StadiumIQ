# Security Policy

## Threat model

SmartStadium (owned by Vinay Bhadane) functions as a public, read-focused demonstration platform. User interaction is limited to two entries: typing a question for the spectator guide and triggering the situation report builder. Key resources requiring protection include Firestore collections, Gemini keys, and API accessibility. Primary security risks consist of query injection attempts, cost exploits on AI endpoints, and leakages of server logs or secrets.

## Controls in place

- **Credential Management**: Google Secret Manager stores the Gemini API key, which is injected into Cloud Run through `--set-secrets`. We maintain zero credentials in the repository, Docker image, or commit history; commits undergo gitleaks checks on push.
- **Parameter Enforcement**: Custom schemas (Zod) validate all JSON request bodies and query parameters prior to routing. Unknown keys are discarded, and guide queries are restricted to 500 characters max.
- **Web Protections**: Restrictive content security policies are enabled via Helmet, alongside a designated CORS origin whitelist, a 100 kB payload cap on JSON requests, and tiered rate limiting. We impose a generic limit on all API endpoints and a smaller window limit for resource-intensive AI services.
- **Prompt Isolation**: Guide requests are embedded within a system prompt instructing the model to rely solely on the provided venue dataset. Responses are processed and rendered strictly as plaintext.
- **Error Sanitization**: A unified global error handler formats all server failures into standard `{ code, message }` patterns. Detailed logs and stack traces are stored privately on the server.

## Authentication decision

We intentionally chose not to require user accounts for this demo. The application handles no private information, implements no write operations (other than the rate-limited situation report builder), and has no administrator views. Introducing an authentication system would introduce unnecessary vulnerability vectors like session tracking and hash storage. Only the backend server has Firestore access via its service account; database rules and credentials are completely hidden from frontend users.

## Reporting a vulnerability

Please create a GitHub issue with the prefix `[security]` (avoid pasting raw exploit steps).
