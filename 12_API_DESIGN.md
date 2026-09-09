# API Design

All backend routes use the `/api` prefix. IDs in examples are UUIDs.

## POST /api/projects

Create a project from prompt.

Request:

```json
{
  "title": "How onboarding works",
  "prompt": "Explain how a user signs up, verifies email, completes profile, and reaches dashboard.",
  "format": "landscape",
  "style": "minimal-tech"
}
```

Response:

```json
{
  "projectId": "4b83f3c8-95a6-4ed0-9e89-53edac5b28c4",
  "status": "draft"
}
```

## POST /api/projects/:id/plan

Generate storyboard and scene graph.

Response:

```json
{
  "projectId": "4b83f3c8-95a6-4ed0-9e89-53edac5b28c4",
  "sceneGraph": {}
}
```

## PATCH /api/projects/:id/scene-graph

Update scene graph.

Use for edits:

- change narration
- reorder scenes
- change icon
- change label
- change pacing

## POST /api/projects/:id/render

Queue render job.

Response:

```json
{
  "jobId": "7f6db5eb-8794-4d5c-a273-7d2d8b74cde9",
  "status": "queued"
}
```

## GET /api/render-jobs/:id

Poll render job status.

Response:

```json
{
  "status": "rendering",
  "progress": 45
}
```

## GET /api/projects/:id

Get project, scene graph, latest render output.

## Validation

Every endpoint that accepts scene graph changes must validate with Zod.

Never save invalid scene graph JSON.
