# Tech Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand for state
- React Hook Form + Zod for forms
- React Flow for structured scene preview/editing

## Backend

- Node.js
- Fastify
- TypeScript
- PostgreSQL (self-hosted on the VPS — no Supabase)
- Drizzle ORM (SQL-native, light Docker image)
- Better Auth (self-hosted auth)
- Redis
- BullMQ
- Brevo (transactional + lifecycle email; SMTP relay for auth emails)

## AI layer

- Gemini API for scene planning
- mock TTS/audio for the first build
- Gemini / Google TTS for voiceover after rendering is reliable
- Zod schemas for structured validation
- Retry and repair pipeline for invalid JSON

## Layout

- Hand-rolled / Dagre layout for MVP (constrained layouts, <=8 nodes)
- ELK.js deferred until free-graph layouts (hub-and-spoke) are needed
- custom layout normalization layer

## Animation

- Remotion for video rendering (deterministic, frame-based)
- Remotion-native `interpolate` / `spring` / `<Series>` for reveals, slides, fades, scene cuts
- GSAP for premium SVG effects: DrawSVG (line-draw), MorphSVG (morphing), MotionPath
  (curved-path motion), and fine-grained easing — **frame-driven only** (seek the timeline
  from `useCurrentFrame()`, never real-time/RAF). Free for commercial use since April 2025.
- Native CSS transitions only for UI micro-interactions, not the final render

## Rendering

- Remotion SSR APIs
- Dockerized renderer
- FFmpeg
- Puppeteer/Chromium dependencies inside worker image

## Storage

Recommended MVP:

- Self-hosted Postgres on the VPS (data)
- Cloudflare R2 for rendered media (zero egress — critical for serving video)
- local placeholder URLs during scaffolding

## Deployment

- Frontend: Vercel or Hetzner/Contabo
- API: Hetzner/Contabo VPS
- Workers: Hetzner/Contabo VPS
- Redis: same VPS for MVP
- Database: self-hosted Postgres on the same VPS for MVP

## Why Hetzner

Hetzner gives better price/performance than many managed platforms for long-running render workers. Rendering video inside serverless functions is usually a bad fit because of runtime limits, memory limits, and cold starts.

## MVP server split

Start simple:

```text
Server 1: app + API + Redis + Postgres + Better Auth + worker
External: Cloudflare R2 storage + Brevo email
```

Later:

```text
Server 1: API
Server 2: Redis
Server 3-N: render workers
Object storage: R2/S3-compatible
```
