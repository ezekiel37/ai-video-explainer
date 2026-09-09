# MVP Decisions

This file is the canonical contract for the first ExplainMotion build. If another document disagrees with this file, this file wins.

## Product Scope

- Product name: ExplainMotion
- First wedge: technical and product process explainers
- First usable output: a 30-90 second animated process explainer
- User edits meaning, not pixels
- No free-form design canvas in MVP

## MVP Feature Boundary

Include:

- prompt input
- storyboard generation mock
- scene graph generation and validation
- editable scene title, narration, labels, icons, pacing, and scene order
- deterministic layout
- Remotion preview/render path
- render job queue
- MP4 landscape export
- mock TTS/audio for the first build

Defer:

- GIF/WebM export
- vertical export
- billing
- marketplace
- collaboration
- brand kits
- custom uploaded SVGs
- AI-generated images
- photography, education, and business-specific packs
- word-level voice sync
- full timeline editor

## Technical Decisions

- Monorepo package manager: pnpm
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Editor state: Zustand
- Scene preview: React Flow for structured preview only
- Backend: Node.js, TypeScript, Fastify
- Validation: Zod
- Database: **self-hosted PostgreSQL** on the Hetzner/Contabo VPS (no Supabase)
- Auth: **Better Auth** (self-hosted)
- ORM: **Drizzle** (SQL-native, light Docker image; replaces Prisma)
- Queue: BullMQ
- Redis: Hetzner/Contabo VPS for MVP
- Renderer: Remotion + React + SVG + **GSAP** (frame-driven, deterministic — see Renderer Contract)
- Layout: hand-rolled/Dagre for MVP; ELK.js deferred until free-graph layouts
- Storage: Cloudflare R2 for rendered media when configured; local placeholder URLs during scaffolding
- Email: **Brevo** (transactional + lifecycle; also SMTP relay for auth emails)
- Deployment: app + API + Redis + Postgres + worker on a single Hetzner/Contabo VPS via Docker for MVP

## API Contract

- All backend routes use the `/api` prefix.
- Project routes:
  - `POST /api/projects`
  - `POST /api/projects/:id/plan`
  - `PATCH /api/projects/:id/scene-graph`
  - `POST /api/projects/:id/render`
  - `GET /api/projects/:id`
- Render job route:
  - `GET /api/render-jobs/:id`

## ID Contract

- Database IDs are UUIDs.
- API examples should use UUID-looking IDs, not short prefixed placeholders.
- Scene-local IDs may use readable strings such as `scene_01`, `user_a`, and `edge_01`.

## Scene Graph Contract

- The scene graph is the source of truth for rendering.
- The LLM may produce structured intent only.
- The LLM must not produce raw HTML, SVG, CSS, JavaScript, or final pixel coordinates.
- Scene graphs must validate before saving or rendering.

Initial supported layouts:

- `horizontal-flow`
- `step-sequence`

Deferred layouts:

- `vertical-flow`
- `hub-and-spoke`
- `compare-two-columns`

Initial visual packs:

- `core`
- `tech-product`

Initial style:

- `minimal-tech`

## Auth And Database Contract

- Auth is **self-hosted via Better Auth**; it owns the `users` table (id is a UUID).
- Application tables reference `users(id)`.
- User-owned rows should use cascade delete unless there is a specific retention requirement.
- Keep the data layer **vanilla Postgres** (no platform-specific features) so hosting stays portable.

## Renderer Contract (animation)

- The renderer is **deterministic**: every frame is a pure function of the frame number.
- GSAP is used for premium effects — **DrawSVG** (line-draw arrows/diagrams), **MorphSVG**
  (shape morphing), **MotionPath** (objects along curved paths), and fine-grained easing.
- GSAP timelines MUST be **frame-driven**: created `paused`, then seeked per frame from
  Remotion's `useCurrentFrame()` (e.g. `tl.seek(frame / fps)`). Never let GSAP run on its
  own real-time/RAF clock — that breaks headless SSR rendering.
- GSAP powers **preset** animations only. Users never touch it (edit meaning, not pixels).
- GSAP + all plugins are free for commercial use (Webflow/GreenSock, since April 2025).

## Build Priority

1. Prove scene graph to deterministic rendered animation.
2. Add prompt to storyboard and scene graph mocks.
3. Add validation and repair/fallback logic.
4. Add editor for meaning-level changes.
5. Add queued render path and MP4 landscape output.
6. Replace mock TTS with real TTS after rendering is reliable.
