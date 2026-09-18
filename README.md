# ExplainMotion

ExplainMotion turns structured process descriptions into editable animated explainers. The initial audience is developers and product teams importing Mermaid flowcharts or short outlines.

## Current implementation

- Next.js studio and API, Better Auth email/password accounts, Drizzle/PostgreSQL storage.
- Public local preview; sign-in required for saving, reopening and server rendering.
- A deterministic prompt demo plus Mermaid/outline import. No external AI generation yet.
- Scene title, narration text, labels, pacing and ordering edits; explicit save with conflict detection.
- Remotion MP4 (1280×720 landscape or 720×1280 portrait) and landscape GIF. Exports are currently silent.
- BullMQ worker with durable PostgreSQL job records, account-scoped status/downloads, idempotent submission and three free renders per UTC calendar month. Failed renders release the allowance; all accounts currently use the free plan.
- Private local media or private R2/S3 objects, streamed through authenticated downloads.

This is a prototype. TTS, billing, email verification/recovery and production operating procedures remain release work. See [ROADMAP.md](ROADMAP.md) for scope and [CODEX_HANDOFF.md](CODEX_HANDOFF.md) for verification results.

## Repository

| Directory | Responsibility |
|---|---|
| `apps/web` | Next.js UI, authentication, API and migrations |
| `apps/worker` | BullMQ processing, durable recovery, rendering and storage |
| `packages/schema` | Zod scene contract |
| `packages/ai` | Deterministic prompt demo and import adapters |
| `packages/layout` | Shared deterministic placement |
| `packages/renderer` | React/SVG preview and frame-driven Remotion exports |
| `packages/assets` | Curated asset metadata |
| `packages/shared` | Queue and status types |

## Development

Use Node 22+ and pnpm 9.15.4. `pnpm install --frozen-lockfile`, then `pnpm dev` runs the public preview. For accounts and renders, provide PostgreSQL and Redis and load the variables from `.env.example` into each process. Use the same absolute `RENDER_OUTPUT_DIR` for web and worker; merely copying a root `.env` does not export it to all workspace scripts.

```bash
pnpm db:migrate
pnpm dev
# Separate terminal, with the same environment:
pnpm dev:worker
```

`db:seed` is a no-op: the public demo stays client-side. Create an account and save your project in the studio. For a complete container setup, follow [10_DEPLOYMENT_HETZNER.md](10_DEPLOYMENT_HETZNER.md).

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`pnpm test:integration` needs a running web server and migrated test database, with the worker stopped. It creates and cleans up isolated test accounts and checks ownership, concurrency, quota and authenticated downloads. `pnpm --filter @explainmotion/web e2e:render` additionally needs Redis and a worker; it creates a test account/project and checks a real MP4 response.

## Documents

[00_MVP_DECISIONS.md](00_MVP_DECISIONS.md) defines the current technical boundary. [DESIGN.md](DESIGN.md) records editor behavior. [12_API_DESIGN.md](12_API_DESIGN.md) describes request bodies. [STRATEGY.md](STRATEGY.md) contains business hypotheses, not shipped entitlements or validated market claims.
