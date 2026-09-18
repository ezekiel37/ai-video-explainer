# Codex handoff — ExplainMotion review fixes

Repository: `ezekiel37/ai-video-explainer`. Review branch: `fix/review-hardening`. Base: `c156e5c274f59199e26a0432f23dd254c101ccf6`.

## Intent

The user asked to review the code and Markdown, fix the problems and push the changes. Preserve the ExplainMotion process-explainer direction and existing visual language. This change repairs prototype reliability; it does not add real LLM planning, TTS or billing.

## Changes

- Require sessions and ownership for all project/job operations and downloads. Remove anonymous server-side rendering and the shared persisted demo.
- Add durable PostgreSQL jobs with immutable graph snapshots, atomic account quota checks, idempotent request UUIDs, a worker outbox dispatcher and fenced result updates. Keep completed status after Redis cleanup.
- Serve owner-only local/private object media with range support. Share local render storage between web and worker; use UUID filenames rather than Redis counters.
- Replace simulated success with explicit errors, bounded job polling/reconnect and retry-safe submission. Add sign-in, explicit save, project reopening, version conflicts, source persistence and unsaved-edit protection.
- Preserve cross-scene Mermaid relationships and overflowing outline items; reject oversize/unsupported input. Retain full source text while abbreviating display labels.
- Validate unique IDs, references, animation end times and the 90-second total ceiling. Share responsive placement and restore portrait/step edges; refit the topology view after imports/resizes.
- Require explicit production configuration, repair setup/API/database documentation, distinguish plans from implemented features, and add tests/CI.

## Verification

Locally checked: all eight package/app TypeScript projects; production Next.js build; configured ESLint; nine regression tests; strict UI source audit; desktop (1440px) and mobile (390px) browser interaction/screenshot checks; HTTP homepage/health and unauthenticated project/job/download access. Frozen-lockfile consistency is checked separately from installed workspace dependencies.

The regression suite exercises graph limits, import preservation, dense layout separation, production secrets, media byte ranges, save-failure recovery, discard consistency and session-expiry recovery. Browser checks cover import, portrait preview, sign-in render guard, discard and overflow.

Not locally verified: PostgreSQL migrations/locking, two-account API integration, Redis recovery, a real worker MP4, Docker build, remote private storage and Brevo delivery. PostgreSQL/Redis are not installed in this environment. Chromium downloaded and browser UI checks worked, but a Remotion still failed when the restricted host denied network-interface enumeration (`uv_interface_addresses`). This is not a successful media-render test.

`.github/workflows/checks.yml` provisions PostgreSQL/Redis, applies migrations, runs API integration and then a real worker render. Review its result after pushing; do not describe added CI as a passed run. `pnpm test:integration` must run with the worker stopped because it deliberately manipulates isolated test job states. The separate `e2e:render` script requires a worker and retains its smoke-test account/project/output for inspection.

## Deployment requirements

Back up PostgreSQL and media, drain legacy queue jobs, stop the old services, apply migration `0002_durable_owned_renders`, and deploy web/worker together. Queue payloads changed. Legacy anonymous/unresolvable projects remain inaccessible; ownership must not be guessed. Use a random production `BETTER_AUTH_SECRET`, correct public `BETTER_AUTH_URL`, database/Redis configuration and shared absolute media path. See `10_DEPLOYMENT_HETZNER.md`.

## Next work

First run the database/worker gates and address any failures. Then verify real-user auth/save/reopen/download and outage recovery on a staging deployment. Callouts, explicit edge animation cues, full emphasis duration/easing, complex diagram routing, account recovery/verification, retention, abuse controls, real TTS/LLM planning and billing remain separate work. Current exports are silent and all accounts are free.

## Suggested Codex prompt

Continue on `fix/review-hardening`. Read README.md, CODEX_HANDOFF.md, DESIGN.md and ROADMAP.md. Check the review branch's CI results, run the PostgreSQL/Redis integration and real-render smoke tests, and fix any failures. Preserve the current product scope. Report what you actually verified and keep unimplemented AI, audio and billing features clearly marked.
