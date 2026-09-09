# ExplainMotion — Roadmap

> Phased build order mapped onto the existing monorepo. Supersedes
> `18_30_DAY_BUILD_PLAN.md`. Strategy context: `STRATEGY.md`.

## Current state (June 2026)

The scaffold exists and typechecks, but the pipeline is **three disconnected mocks**:

- `apps/web` runs 100% client-side; it never calls `apps/api`.
- `apps/api` stores projects/jobs in an in-memory Map and **never enqueues** to BullMQ.
- `apps/worker` listens on a queue nothing publishes to, and can't report status back.
- `packages/renderer` does **not** animate or call `@remotion/renderer`; it renders
  a static first scene. No `useCurrentFrame`/`interpolate`, no scene sequencing.
- `schema.prisma` is well-formed but unused (no Prisma client, no DB).

The spine (`packages/schema` scene graph) is strong and is the foundation everything
else plugs into.

---

## Phase 0 — Make one path real end-to-end (prerequisite)

**Goal:** a single prompt flows web → api → queue → worker → status, persisted in a DB.
Nothing in the strategy works until this exists.

**Architecture:** 2 services — `apps/web` (Next.js UI **+ API route handlers under
`app/api/...`**) and `apps/worker` (the render consumer). The standalone Fastify API was
folded into Next (the API logic lives in `apps/web/lib/server/`). Extract a standalone API
later only when the embed/render-API tier or non-web clients arrive.

**Status (verified live against Docker Redis + Postgres):**
- ✅ Render loop: web API route → BullMQ(Redis) → worker → real Remotion render → status.
  A job enqueued via `/api/projects/:id/render` renders a real MP4 and reports `completed`.
- ✅ Persistence: Drizzle + Postgres (Prisma scaffold removed). Projects survive a restart.
  Migrations in `apps/web/drizzle` (`pnpm db:migrate`, then `pnpm db:seed`).
- ✅ Auth: Better Auth in the Next app (`lib/server/auth.ts`, `/api/auth/[...all]`). Verified
  live — sign-up persists a user, the session ties a created project to its owner, and
  anonymous create still works (`projects.user_id` nullable). Tables: `user/session/account/
  verification` in the same Postgres.
- ✅ Infra: multi-stage `Dockerfile` (with the Chromium libs Remotion needs) + `.dockerignore`
  + `docker-compose.yml` (web + worker + redis + postgres). Verified live — the whole stack
  builds and runs in containers; a render enqueued through the web container is processed by
  the worker container into a real MP4. Dev: `docker compose up -d postgres redis` →
  `docker compose run --rm web pnpm --filter @explainmotion/web db:migrate` (+ `db:seed`) →
  `docker compose up -d web worker`.

**Phase 0 is complete.** Next: Phase 1 polish (responsive layout for >5 nodes, render
verification harness) and Phase 2 (the Mermaid → scene-graph beachhead adapter).

Local dev: `docker run -d -p 6379:6379 redis:7` and a Postgres container, set
`DATABASE_URL` + `REDIS_URL`, then `db:migrate`, then `start` the api/worker/web.

| Task | Package(s) |
|---|---|
| Wire `web` to call the API (`POST /projects`, `/plan`, `PATCH /scene-graph`, `/render`, poll `GET /render-jobs/:id`) instead of importing the mock generator | `apps/web/lib/store.ts` |
| `POST /:id/render` actually creates a BullMQ `Queue` and `.add()`s the job | `apps/api`, `packages/shared` |
| Worker writes status/progress back to a shared store (Redis or DB), not just logs | `apps/worker` |
| Stand up self-hosted Postgres on the VPS; wire **Drizzle** (replace Prisma scaffold); drop the in-memory Map; resolve the missing `userId` | `apps/api`, `db/` |
| Add **Better Auth** (self-hosted); it owns the `users` table | `apps/api` |
| Fix Dockerfile (build stage + real `CMD`, run compiled JS not `tsx`); add `web` to compose; commit `.env` template usage | root, `Dockerfile`, `docker-compose.yml` |

**Done when:** a user types a prompt in the browser and a (placeholder) job runs to
`completed` with state surviving a server restart.

## Phase 1 — Make the renderer actually animate (the product)

**Goal:** the scene graph produces a real animated MP4, not a static poster.

| Task | Package(s) |
|---|---|
| Sequence all scenes with `<Series.Sequence>`; derive `durationInFrames` from the graph × fps | `packages/renderer` |
| Implement real motion with `useCurrentFrame` + `interpolate`: `fade-in`, `slide-in`, `highlight-node`, `trace-arrow`, staggered reveals | `packages/renderer` |
| Add GSAP premium effects (DrawSVG line-draw arrows, MorphSVG, MotionPath) — **frame-driven**: `paused` timeline seeked from `useCurrentFrame()`; verify they render identically headless vs preview | `packages/renderer` |
| Consume the `animations[]` the AI already emits (currently ignored) | `packages/renderer` |
| Call `@remotion/renderer` `renderMedia` from the worker; output to local volume, then R2 | `apps/worker`, `packages/renderer` |
| Unify the two divergent layouts into one shared module; make canvas/viewBox responsive to node count (8 nodes must not overflow) | `packages/layout`, `packages/renderer`, `apps/web/components/SceneFlowPreview.tsx` |
| Unit tests for `validateSceneGraph` and `generateMockSceneGraph` output | `packages/schema`, `packages/ai` |

**Done when:** "How Money Transfer Works" renders as a smooth narrated-timing MP4 the
team would actually post.

## Phase 2 — Beachhead adapter: Mermaid/diagram → scene graph

**Goal:** the defensible "wow" demo. Paste a Mermaid diagram, get a narrated animation.

| Task | Package(s) |
|---|---|
| Mermaid/D2 parser → scene-graph mapper (nodes/edges → scene-graph node types) | `packages/ai` (new adapter alongside the prompt mock) |
| Input UI: "Paste diagram" tab next to the prompt box | `apps/web` |
| Map diagram node shapes → `service-card` / `database-card` / `device-card` / etc. | `packages/ai`, `packages/assets` |
| Auto-narration from node labels + edges (mock first, real LLM later) | `packages/ai` |

**Done when:** a developer pastes a real repo's Mermaid block and gets a clean
animated explainer in one step.

**Status: shipped & verified live.**
- `packages/ai/src/mermaid.ts` — `parseMermaid` (flowchart subset: `[]`, `()`, `([])`,
  `[[]]`, `[()]`, `(())`, `{}`, `{{}}`, labeled `-->|x|` and `-- x -->` edges, chains,
  `TB/LR` direction) and `mermaidToSceneGraph` (shape→node-type, ≤8-node scene chunking,
  auto narration, validated against `sceneGraphSchema`).
- API: `POST /api/projects/:id/import-mermaid`. Web: "Paste a diagram (Mermaid)" box +
  Import button (`store.importDiagram`), with a client-side parse fallback.
- Verified: pasted diagrams render into clean explainers (cylinders, hexagons, pills,
  avatars, labeled flowing arrows) both as stills and through the live API.

## Phase 3 — Output formats & the re-render loop

**Goal:** match where people publish, and make freshness one-click.

| Task | Package(s) |
|---|---|
| GIF / looping clip export (cheapest viral unit) | `apps/worker`, `packages/renderer` |
| 9:16 vertical preset (Reels/Shorts) | `packages/renderer`, `packages/layout` |
| Re-render loop: edit source/scene graph → one-click regenerate same project | `apps/web`, `apps/api` |
| R2/S3 storage wired (replace placeholder URLs) | `apps/worker`, env |

**Done when:** one project re-exports to 16:9, 9:16, and GIF, and re-rendering after an
edit takes one click.

**Status:**
- ✅ GIF export — `renderExplainer({ format: "gif" })` (codec gif, ~15fps, infinite loop).
  Threaded through `RenderJobData` → worker (writes `.gif`) → API → UI. Verified live: a GIF
  job rendered to `/render-output/1.gif`.
- ✅ 9:16 vertical — `orientation: "portrait"` sets 720×1280 via `calculateMetadata` and forces
  a vertical step layout; `fitScale` keeps dense scenes in-frame. Verified via portrait still.
- ✅ Re-render loop — edits (title/narration/labels/order) are saved (`PATCH /scene-graph`)
  before each render, so re-rendering a project picks up changes. UI exposes **MP4 16:9 / 9:16 / GIF**.
- ✅ R2/S3 storage — `apps/worker/src/storage.ts` uploads renders to R2/S3 (S3 SDK,
  `forcePathStyle`) and returns a public URL; local fallback when unconfigured. Verified live
  against MinIO (object uploaded, public URL returned, HEAD confirmed). **Phase 3 complete.**

## Phase 4 — Monetization & growth plumbing

**Goal:** flat pricing, free-tier virality, lifecycle email.

**Status:**
- ✅ Auth — Better Auth (done in Phase 0).
- ✅ Watermark — `ExplainerComposition` renders a "Made with ExplainMotion" badge when
  `watermark: true`; threaded through the pipeline. Verified via still.
- ✅ Free tier — `lib/server/entitlements.ts` (free: watermark + 3 videos/mo; pro/team:
  none) + `render_events` usage table. Render route checks `rendersThisMonth` and returns
  402 over the cap. **Verified live:** 3 renders queued (watermark on), the 4th got 402.
- ✅ Brevo — `apps/worker/src/email.ts` sends a render-complete email via Brevo's API when
  `notifyEmail` + key are set; graceful no-op otherwise (structural; not sent in tests).
- ⬜ Billing (Stripe) to actually move users to pro/team — `getPlan` is the swap-in point.
- ⬜ SEO template landing pages.

## Phase 5 — Audience expansion (same engine)

Add the remaining front doors. Each is an adapter + output preset + template pack —
**not a new product.**

| Step | Adapter | Output preset | Package(s) |
|---|---|---|---|
| Founders | PRD / feature / spec → scene graph | launch video + GIF | `packages/ai`, `apps/web` |
| Creators | blog post / script / thread → scene graph | 9:16 explainer | `packages/ai`, `apps/web` |
| Themes | `product-flow`, `boardroom` themes | re-theme = re-render | `packages/renderer` |

**Status:**
- ✅ Text adapter — `packages/ai/src/text.ts` `textToSceneGraph` (markdown outlines: headings
  → scenes, bullets/sentences → nodes, sequential edges, auto narration, schema-validated).
  Covers **both** the founder (PRD/feature) and creator (post/script) doors.
- ✅ Auto-detect — `contentToSceneGraph` routes Mermaid → diagram parser, everything else →
  text. The studio's single "diagram or outline" box uses it. Verified via still (a PRD
  outline rendered into a clean 5-step explainer with auto icons).
- Note: free-form prose is heuristic; quality improves a lot with an LLM pass later (the
  `prompt` door is the natural place to add Gemini). Themes still pending.

---

## Sequencing principle

Phases 0 → 1 are non-negotiable prerequisites (turn three demos into a product).
Phase 2 is the wedge that makes it *sellable*. Phases 3–5 broaden reach on the same
spine. Do not start Phase 5 adapters before the engine (0–1) is real.
