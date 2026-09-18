# System Architecture

Two application services share PostgreSQL and Redis. `apps/web` is the Next.js studio, Better Auth endpoint and API. `apps/worker` consumes BullMQ jobs and calls Remotion. There is no standalone Fastify service.

The browser performs local demo generation/import and scene editing. An explicit save sends the source, validated graph and expected project version. PostgreSQL rejects stale writes with a 409. Opening a project restores its source, graph and latest durable render status.

Rendering reserves a PostgreSQL job under an account row lock, atomically enforcing the free allowance and one active job. Its UUID is both the idempotency key and queue ID. The reservation stores an immutable graph/version and output settings; enqueueing is best effort after commit. A worker dispatcher checks PostgreSQL every 15 seconds to recover missing queue entries. This is an outbox pattern without requiring a distributed database/Redis transaction.

The worker uses a per-attempt lease token and heartbeat, renders to a unique path, stores private media, then marks the durable job complete. Browser polling is bounded and stops on terminal states or repeated errors. A project can be reopened to recover status after refresh or Redis cleanup.

Downloads require the job owner's session and support byte ranges. Local mode uses a shared volume; object storage mode streams private R2/S3 responses. Optional completion email links to the authenticated project page.

Future LLM planning, TTS and synchronization are separate planned stages. The current execution path does not call those providers.
