# Rendering Pipeline

## Why Remotion

Remotion gives the product a deterministic video rendering foundation.

Use it to:

- render React components into video
- synchronize audio and visuals
- export MP4
- render server-side with Node/Bun APIs
- maintain reusable scene components

## Why GSAP

GSAP should be used for:

- timeline choreography
- SVG path tracing
- arrow animation
- precise sequencing
- chained motion
- complex reveal timings

## Recommended rendering flow

```text
SceneGraph JSON
  ↓
Normalize layout
  ↓
Resolve assets
  ↓
Compile to Remotion composition props
  ↓
Generate audio
  ↓
Generate timeline cues
  ↓
Render MP4 with Remotion worker
```

## Remotion components

Suggested structure:

```text
/apps/web/remotion/
  Root.tsx
  compositions/
    ExplainerComposition.tsx
  scenes/
    FlowScene.tsx
    CompareScene.tsx
    HubScene.tsx
  primitives/
    NodeCard.tsx
    Arrow.tsx
    Callout.tsx
    Avatar.tsx
    Badge.tsx
  animation/
    useSceneTimeline.ts
    gsapTimeline.ts
```

## Frame-based animation

Prefer converting animation timings into frames.

Example:

```ts
const startFrame = secondsToFrames(cue.startTime);
const durationFrames = secondsToFrames(cue.duration);
```

This helps keep preview and final render consistent.

## Audio sync

Store cue markers:

```json
{
  "sceneId": "scene_03",
  "cues": [
    {
      "id": "cue_01",
      "time": 3.2,
      "action": "highlight-node",
      "target": "api_server"
    }
  ]
}
```

## Warning

Do not rely on live browser timing for exported video.

The exported video must be driven by deterministic frame calculations.
