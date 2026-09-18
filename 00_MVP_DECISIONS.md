# MVP Decisions

Canonical current technical contract. Product: ExplainMotion, a constrained process explainer for developers and product teams. Users edit meaning and order, not pixels.

## Implemented boundary

- Public demo preview and signed-in project save/reopen.
- Prompt-based fixed demo generation, Mermaid flowchart subset and heuristic outlines.
- Scene titles, narration text, labels, pacing and order editing.
- Validated JSON, up to eight scenes, eight nodes and twelve edges per scene, maximum 90 seconds total. The 30–90 second duration target is planning metadata; shorter imported clips are allowed.
- Shared horizontal/step placement, frame-driven Remotion rendering, MP4 landscape/portrait and landscape GIF.
- Silent output. Narration is caption text, not synthesized speech.
- Three free renders per UTC calendar month, one active job per account, watermark on. No paid entitlement can currently be purchased.

## Technical contract

Next.js App Router owns UI and API; a separate Node/BullMQ worker renders. PostgreSQL/Drizzle owns projects, auth and durable render records. Redis transports work. Better Auth owns singular `user`, `session`, `account`, `verification` tables with **text** IDs. Projects and render jobs use UUIDs. Server routes enforce ownership before returning data or causing side effects.

Edits include a version and use optimistic concurrency. Render requests include a caller-generated UUID; retries reuse it and the same project version/options. Reservations and quota checks run under an account row lock. Accepted jobs contain immutable scene graph snapshots. The worker reconstructs missing Redis entries from PostgreSQL and fences result updates with a lease token.

Local storage requires a directory shared by web and worker. R2/S3 buckets stay private; output keys never become unauthenticated public links. Production startup requires an explicit strong auth secret and configured database/Redis/media environment.

## Rendering contract

`packages/renderer` uses Remotion frames and SVG. The GSAP helper exists but is not connected to the current compositions. Future effects must remain frame-driven. The model must never supply raw HTML/SVG/CSS/JavaScript or pixel coordinates. Callouts and some animation enum values are schema vocabulary ahead of renderer support; see the rendering document before using them.

## Deferred

Real LLM planning, TTS/audio synchronization, richer animation semantics, brand kits, billing, collaboration, arbitrary uploads, custom SVG and free-form canvas editing. Verify account recovery, email verification, retention, backups and rate controls before a public paid launch. See ROADMAP.md for sequencing.
