# Scene Graph Schema

## Principle

The scene graph is the source of truth.

Every generated video should be reproducible from the scene graph.

Database-backed project IDs are UUIDs. Scene-local IDs may use readable strings such as `scene_01` or `user_a`.

## Enums

Initial supported project formats:

- `landscape`

Initial supported styles:

- `minimal-tech`

Initial supported layouts:

- `horizontal-flow`
- `step-sequence`

Initial supported node types:

- `avatar-card`
- `service-card`
- `database-card`
- `device-card`
- `icon-card`
- `plain-card`
- `badge`
- `progress-bar`

Initial supported edge types:

- `arrow`

Initial supported animation types:

- `fade-in`
- `slide-in`
- `pulse`
- `highlight-node`
- `trace-arrow`
- `zoom-focus`
- `reveal-badge`
- `scene-cut`

## High-level project schema

```json
{
  "projectId": "4b83f3c8-95a6-4ed0-9e89-53edac5b28c4",
  "title": "How Money Transfer Works",
  "format": "landscape",
  "durationTargetSeconds": 60,
  "style": "minimal-tech",
  "voice": {
    "provider": "mock",
    "voiceId": "default",
    "speed": 1.0
  },
  "scenes": []
}
```

## Scene schema

```json
{
  "id": "scene_01",
  "title": "User starts transfer",
  "durationSeconds": 8,
  "narration": "User A enters the amount and taps transfer.",
  "layout": "horizontal-flow",
  "nodes": [],
  "edges": [],
  "callouts": [],
  "animations": []
}
```

## Node schema

```json
{
  "id": "user_a",
  "type": "avatar-card",
  "label": "User A",
  "asset": "avatars/default-user",
  "role": "sender",
  "importance": "primary",
  "metadata": {
    "balance": "₦50,000"
  }
}
```

## Edge schema

```json
{
  "id": "edge_01",
  "from": "user_a",
  "to": "api_server",
  "type": "arrow",
  "label": "Transfer request",
  "animation": "trace-arrow"
}
```

## Animation schema

```json
{
  "id": "anim_01",
  "type": "highlight-node",
  "target": "user_a",
  "startTimeSeconds": 1.2,
  "durationMs": 800,
  "easing": "easeOut"
}
```

## Validation rules

- max 8 nodes per scene
- max 12 edges per scene
- max 4 callouts per scene
- narration per scene must not exceed 25 words
- every edge must have valid from/to node IDs
- no orphan nodes unless marked as decorative
- no scene longer than 15 seconds in MVP
- no animation without a valid target
- no negative animation timing
- every scene must include at least one visual change
- project `format` must be `landscape` for the first build
- scene `layout` must be `horizontal-flow` or `step-sequence` for the first build
