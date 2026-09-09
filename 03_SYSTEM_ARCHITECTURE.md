# System Architecture

## Core pipeline

```text
Prompt
  ↓
LLM Orchestrator
  ↓
Storyboard JSON
  ↓
Scene Graph JSON
  ↓
Layout Engine
  ↓
Animation Planner
  ↓
TTS Voiceover
  ↓
Timeline Sync Engine
  ↓
Remotion Renderer
  ↓
Video Output
```

## Key architectural rule

The LLM does not generate raw HTML, SVG, CSS, or final coordinates directly.

The LLM generates structured intent.

The system validates and renders it.

## Components

### 1. Prompt Analyzer

Takes raw user explanation and extracts:

- topic
- audience
- tone
- domain
- entities
- process steps
- dependencies
- expected video length
- output format

### 2. Storyboard Generator

Creates scenes:

- title
- narration
- visible elements
- transition idea
- key visual emphasis

### 3. Scene Graph Generator

Converts storyboard into machine-readable objects:

- nodes
- edges
- groups
- callouts
- icons
- assets
- animation intents

### 4. Layout Engine

Takes scene graph and assigns deterministic layout:

- position
- alignment
- spacing
- edge routing
- scale
- collision checks

### 5. Animation Planner

Assigns animation presets:

- reveal order
- arrow movement
- highlight timing
- camera zoom
- transitions

### 6. TTS Engine

Generates voiceover audio.

First build:

- mock TTS/audio

Later provider:

- Gemini TTS / Google TTS stack

### 7. Timeline Sync Engine

Aligns animation actions to narration timing.

### 8. Renderer

Renders video using:

- Remotion
- React
- SVG
- GSAP timelines where needed

### 9. Worker Queue

Rendering happens asynchronously on Hetzner.

Use:

- BullMQ
- Redis
- Node.js workers
