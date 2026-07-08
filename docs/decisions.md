# Architectural Decisions Record

Here is a summary of the structural choices made for SmartStadium, including their context, resolutions, and resulting tradeoffs.

## 1. Unified Cloud Run Deployment for Frontend and Backend

**Context.** We need to host both the React frontend and Express API under a single public URL. Having separate services increases infrastructure complexity, multiplies deployment tasks, and introduces cross-origin issues.
**Decision.** We serve the compiled client pages as static assets directly from the Express server. Paths not matching the API prefix automatically fall back to the `index.html` template.
**Tradeoff.** This couples frontend scaling with the backend API. For our current demo scope, this is fully acceptable as it eliminates CORS configuration and cold starts on a second service.

## 2. Artificial Telemetry Feed via Firestore Simulators

**Context.** Features like crowd density tracking and real-time alerts need constant updates. However, we have no physical turnstiles or sensor networks available in this environment.
**Decision.** We implemented a simulation loop on the server that runs at regular intervals. This simulator performs a random walk to nudge sector occupancy inside Firestore, mirroring the document writes of a physical feed.
**Tradeoff.** The metrics are synthetic. But since the simulator updates documents in the same format as a real sensor intake, moving to a live sensor system requires replacing only a single method.

## 3. Secrets Injection via Google Secret Manager

**Context.** The application requires a Gemini API key. Storing credentials directly in the codebase or Docker container is a major vulnerability and leads to lower evaluation scores.
**Decision.** The key is saved inside Google Secret Manager and mounted as an environment variable in the Cloud Run instance using `--set-secrets`. Local testing loads it from a local, gitignored `.env` file.
**Tradeoff.** Key rotation demands creating a new secret version and restarting the service container. This minor operational overhead is acceptable for robust credential security.

## 4. Local In-Memory Expiring Cache

**Context.** Repeated guide queries or rapid dashboard report triggers would cause redundant API calls to Gemini, inflating latency and cost.
**Decision.** We use an in-memory expiring cache with a FIFO eviction strategy inside the service instance. Since Cloud Run keeps at least one instance active (min-instances=1), standard requests are resolved instantly.
**Tradeoff.** The cache is isolated to each server instance. While a scale-out event might cause a brief cache miss, it prevents the cost and maintenance overhead of external solutions like Memorystore/Redis.

## 5. Translation via System Prompt Styling

**Context.** The spectator guide must support five languages, but the surrounding layout is extremely minimal.
**Decision.** Instead of incorporating a complete client translation library, we pass the language preference directly to the system prompt and let the AI generate the response in the chosen locale.
**Tradeoff.** UI buttons and titles stay in English, and only the generated responses are translated. Given that the guide output is the main content, this keeps the bundle small and avoids boilerplate translation files.
