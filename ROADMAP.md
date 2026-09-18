# ExplainMotion Roadmap

Status reflects source implementation, not a production launch certification. See CODEX_HANDOFF.md for checks actually run for the review fixes.

## Available in the prototype

- Next.js studio/API, Better Auth accounts, PostgreSQL/Drizzle persistence.
- Local fixed prompt demo and deterministic Mermaid/outline import.
- Meaning edits, explicit save, owned project reopening and version conflict handling.
- Remotion frame-driven animation, MP4 landscape/portrait, GIF and watermark.
- BullMQ execution with PostgreSQL reservations/results, retry-safe submission, quota serialization and private downloads.
- Optional R2/S3 storage and Brevo completion adapter.

## Release gates

1. Run database/API integration checks and real worker smoke renders in the deployment environment. Exercise two accounts, retries, Redis loss, worker crash, remote private storage and shared-volume downloads.
2. Complete browser verification at narrow and desktop widths, including save conflict, session expiry, quota error and interrupted job polling.
3. Finish renderer semantics for callouts, explicit edge cues, emphasis duration/easing and difficult branching/self-loop diagrams. Existing static preview is not an animated player.
4. Configure auth verification/recovery, abuse/rate limits, backups, retention and observability. Decide legacy unowned data policy.

## Next product work

1. Validate the Mermaid process-explainer use case with users and representative diagrams.
2. Integrate real structured LLM planning and bounded repair, keeping the schema as the trust boundary.
3. Add TTS, audio track mixing and timing synchronization; current exports are silent.
4. Measure render cost, latency and failure rates before choosing paid allowances/pricing. Add billing only after entitlement and webhook tests.
5. Expand themes and source adapters based on usage evidence.

D2, GSAP premium compositions, brand kits, collaboration, arbitrary uploads, marketplaces and free-form canvas remain deferred. The strategic audience/price assumptions in STRATEGY.md are hypotheses.
