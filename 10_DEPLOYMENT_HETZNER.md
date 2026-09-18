# Deployment

The supplied Compose configuration runs Next.js web/API, a render worker, PostgreSQL 16 and Redis 7. It binds web to host loopback port 3000; use a TLS reverse proxy for public access. Database/Redis have no public port bindings.

## First deployment

1. Copy `.env.example` to `.env`; set a randomly generated `BETTER_AUTH_SECRET` (at least 32 characters) and the public `BETTER_AUTH_URL`. Leave `NEXT_PUBLIC_APP_URL` blank for same-origin browser auth. Compose supplies internal database/Redis URLs and the shared media path.
2. Build and start data services:

```bash
docker compose build
docker compose up -d postgres redis
docker compose run --rm web pnpm --filter @explainmotion/web db:migrate
docker compose up -d web worker
```

3. Open the studio, create an account, import/save a project and render. Confirm the authenticated download works. Ensure the worker can download Remotion's headless Chrome on first render, or pre-provision it in your image.

The image installs Chromium system libraries. Local media uses `em-renders`, mounted read-only in web and writable in worker. Redis uses append-only persistence; PostgreSQL remains authoritative for reservations/results after Redis loss. Object storage requires `STORAGE_PROVIDER=r2` or `s3`, bucket, endpoint, access key, secret and region. Keep the bucket private and use matching configuration in both services. There is no public-URL fallback for missing credentials.

Startup validates production secrets and required service/media configuration. Secrets belong in runtime environment, not Docker build args or committed files. The included internal database password is a development default: change the database credentials and both service URLs together for your deployment.

## Upgrades and operations

Back up PostgreSQL and local media before migrations. Stop old web/worker versions before applying 0002: queue payloads changed from graph objects to durable job IDs, and legacy anonymous projects become inaccessible. Drain old jobs first. Deploy web and worker together, apply migrations once, then restart. Do not remove persistent volumes to upgrade.

Monitor queued age, stale heartbeats, worker failures, media capacity and database backups. Restrict outbound worker access appropriately, set CPU/memory/render concurrency, and test restore procedures. Automatic media retention and orphan cleanup are not yet implemented. Remote provider/Brevo delivery and real worker renders need deployment-specific verification.

For local host development, provide your own reachable PostgreSQL/Redis or a local Compose override exposing loopback ports. Export variables into each process; root `.env` is consumed by Compose, not automatically by all pnpm scripts. Use the same absolute `RENDER_OUTPUT_DIR` for web and worker.
