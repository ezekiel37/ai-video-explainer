# Database Schema

The authoritative definitions are `apps/web/lib/server/db/schema.ts` and `auth-schema.ts`; SQL migrations and snapshots are in `apps/web/drizzle`. Apply with `pnpm db:migrate` from the repository root.

| Table | Purpose and identity |
|---|---|
| `user` | Better Auth account; text primary key, unique email |
| `session` | Better Auth session; text ID and user FK |
| `account` | Better Auth credential/provider record; text ID and user FK |
| `verification` | Better Auth verification records; text ID |
| `projects` | UUID ID, owner text FK, title/source/source_type, version, JSONB scene_graph, timestamps |
| `render_jobs` | UUID request/job ID, owner/project FKs, project_version and graph snapshot, format/orientation/watermark, status/progress, output_key/error_message, lease_token/heartbeat and timestamps |
| `render_events` | Historical usage retained for pre-migration monthly allowances |

Application references to Better Auth use text IDs, not UUIDs or Supabase auth IDs. Owner FKs cascade on account deletion. New projects always have an authenticated owner. Legacy anonymous/unresolvable owners remain NULL and cannot be read or claimed through private API routes. Migration 0002 clears invalid legacy owner references before adding the FK; back up before migrating and handle any legitimate legacy ownership recovery administratively.

Project version starts at 1 and increments on each successful save. A stale expected version produces a conflict instead of overwriting edits. `projects.status` is retained for compatibility; `render_jobs.status` is authoritative for renders. Job states are queued, rendering, uploading, completed or failed; progress is constrained to 0–100.

Allowance checks count nonfailed reservations plus historical render events in the current UTC month under a user row lock. Job records remain in PostgreSQL after queue retention expires. Media is addressed by a private output key; no public URL or thumbnail table is implied.

Asset packs are currently code metadata. Voiceover, asset-library and billing tables are future schema work.
