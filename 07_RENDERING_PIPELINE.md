# Rendering Pipeline

1. Reserve an owned render with an immutable validated graph in PostgreSQL.
2. Publish its UUID to BullMQ; the worker dispatcher retries missing publications.
3. Claim the job with a per-attempt lease and update heartbeat/progress.
4. `packages/renderer/src/render.ts` bundles the Remotion entry and selects the composition.
5. Render H.264 MP4 or GIF, using shared scene placement and frame-driven effects.
6. Keep the file in a shared local volume or upload to private R2/S3.
7. Commit completion and the unique output key in PostgreSQL; optionally email the project link.
8. Serve the owner's authenticated media request, including range requests.

The job graph never changes if its project is edited during rendering. Output filenames include job and lease UUIDs, preventing Redis counter resets or stale attempts from overwriting another result. A failed attempt is retried once; terminal failure releases the allowance. Durable completed jobs survive Redis cleanup. PostgreSQL and local media still need backups.

MP4 sizes: landscape 1280×720, portrait 720×1280. GIF uses every second frame. Portrait uses step placement; arrows retain their source/target direction. `ScenePreview` scales the same stage geometry to its container. React Flow is a separate topology aid, not a frame-accurate movie player.

Current animation code is Remotion/SVG (`animation.ts`, `index.tsx`). GSAP's helper is unused. Captions are text; no audio track/TTS is produced. Callouts, explicit edge animation cues and complete emphasis-duration/easing semantics remain renderer work. Do not promise these based on schema enum names alone.

Regression tests cover schema/import/layout boundaries. The real-render smoke script additionally needs Chromium, a worker, Redis and PostgreSQL; see README.md.
