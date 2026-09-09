# Programmable Explanation Videos — MVP Build Pack

## Canonical documents

- **Strategy / business / positioning:** `STRATEGY.md` (supersedes the old brief, GTM, and monetization docs).
- **Build order:** `ROADMAP.md` (supersedes the old 30-day plan).
- **Technical MVP contract:** `00_MVP_DECISIONS.md`. If another technical document disagrees with it, the decisions file wins.

## Product definition

A tool that turns a written explanation into a short animated visual explanation video.

Not Canva.
Not After Effects.
Not a generic AI video generator.

The product is a constrained explanation engine:

> User describes a process → system converts it into scenes → scenes become animated boxes, arrows, icons, avatars, voiceover, and video export.

## First positioning

**Programmable explanation videos for technical and product process explainers.**

The core promise:

> Explain anything visually in minutes.

## MVP constraint

Version 1 must stay narrow:

- 30–90 second videos
- one default visual style: `minimal-tech`
- core + tech/product visual packs only
- controlled SVG/icon packs
- no free-form canvas editing
- no arbitrary LLM-generated HTML/SVG
- structured scene JSON as the source of truth
- Remotion + GSAP rendering pipeline
- Hetzner worker for rendering
- MP4 landscape export first

## Primary users

Start with users who already feel the pain of explaining abstract workflows:

1. Startup founders creating product walkthroughs
2. SaaS teams creating onboarding videos
3. Technical creators explaining systems
4. Educators creating short visual lessons
5. Product managers explaining flows internally

Avoid serving everyone at first.

## Core product loop

1. User enters a detailed explanation.
2. AI converts it into a storyboard.
3. User reviews scenes and narration.
4. System generates animation timeline.
5. TTS voiceover is generated.
6. Renderer produces video.
7. User exports MP4.

## Current scaffold

The first build is now structured as a pnpm monorepo:

```text
apps/
  web/      Next.js MVP studio
  api/      Fastify API scaffold
  worker/   BullMQ worker scaffold
packages/
  schema/   Zod scene graph contract
  ai/       mock storyboard and scene graph generation
  assets/   core + tech/product asset metadata
  layout/   deterministic MVP layout helpers
  renderer/ React/SVG preview and Remotion root
  shared/   queue/status helpers
```

## Local development

Install dependencies:

```bash
pnpm install
```

Run the web studio:

```bash
pnpm dev
```

Run the API:

```bash
pnpm dev:api
```

Run the worker with Redis available:

```bash
pnpm dev:worker
```

The web app currently supports the MVP vertical slice:

- prompt input
- mock storyboard and scene graph generation
- `horizontal-flow` and `step-sequence` previews
- meaning-level scene editing
- scene graph validation feedback
- simulated render job progress
- landscape MP4 output placeholder
