# API Design

All project/job routes require a Better Auth session. Missing sessions return 401; resources owned by another account return 404. Auth endpoints are under `/api/auth/*`. Project/job IDs are UUIDs; auth user IDs are text.

| Method and path | Body / response |
|---|---|
| `POST /api/projects` | `{title, prompt, sourceType?: "prompt" | "import"}` → project row, `id`, `version` (201) |
| `GET /api/projects` | Most recent 100 owned project summaries |
| `GET /api/projects/:id` | Owned project, source, graph, version and `latestRender` |
| `POST /api/projects/:id/plan` | `{version, prompt}` → updated project using fixed demo planner |
| `POST /api/projects/:id/import-mermaid` | `{version, diagram}` → updated project; adapter also accepts outlines |
| `PATCH /api/projects/:id/scene-graph` | `{version, sceneGraph, prompt, sourceType}` → updated project with incremented version |
| `POST /api/projects/:id/render` | `{requestId, version, format, orientation}` → durable job snapshot (202) |
| `GET /api/render-jobs/:id` | Owned durable job snapshot |
| `GET /api/render-jobs/:id/download` | Owner-only media; optional `?download=1`, supports `Range` |

`requestId` must be a new UUID for a new render; reuse exactly the same request ID/version/format/orientation when retrying an uncertain submission. A replay returns the existing job even if it failed; deliberately rendering again needs a new UUID. Reusing an ID for different inputs returns 409. Rendering never silently creates or substitutes a demo project.

Formats: `mp4` or `gif`. Orientations: `landscape` or `portrait`. The UI offers landscape MP4/GIF and portrait MP4. The graph's base format remains landscape; orientation is an export setting.

Snapshot shape:

```json
{
  "id": "7f6db5eb-8794-4d5c-a273-7d2d8b74cde9",
  "projectId": "4b83f3c8-95a6-4ed0-9e89-53edac5b28c4",
  "projectVersion": 2,
  "status": "rendering",
  "progress": 45
}
```

`outputUrl` appears only for a completed job with stored media, and points to the authenticated download route. `errorMessage` is present for failure. No storage credentials/keys are exposed.

Other statuses: 400 invalid JSON/schema/input, 402 monthly allowance exhausted, 409 stale project or unavailable media, 429 another active render, 500 unexpected service failure. Client edits remain available on save/render errors. Source length is at most 20,000 characters. The graph projectId must match its route and validate against the shared schema.
