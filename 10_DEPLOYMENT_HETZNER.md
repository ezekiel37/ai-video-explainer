# Hetzner Deployment Plan

## Recommended MVP deployment

Use Hetzner for the API and rendering worker.

Suggested initial setup:

```text
Hetzner VPS
  ├── Docker
  ├── API server
  ├── render worker
  ├── Redis
  ├── Nginx/Caddy
  └── FFmpeg/Chromium dependencies
```

External services:

```text
Supabase
  ├── Auth
  ├── Postgres
  └── optional storage

Cloudflare R2
  └── video/audio/object storage
```

## Why not Vercel for rendering

Vercel is fine for the frontend.

But video rendering is CPU-heavy and long-running.

Rendering should run on a worker:

- no serverless timeout issues
- easier FFmpeg setup
- easier queue management
- predictable costs
- better control over Chromium/Puppeteer dependencies

## Docker services

```yaml
services:
  api:
    build: .
    command: pnpm start:api
    ports:
      - "3001:3001"
    env_file:
      - .env

  worker:
    build: .
    command: pnpm start:worker
    env_file:
      - .env
    depends_on:
      - redis

  redis:
    image: redis:7
    ports:
      - "6379:6379"
```

## Basic Nginx/Caddy role

Use Caddy if you want simpler SSL.

Routes:

```text
api.yourdomain.com → API server
app.yourdomain.com → frontend
```

## Worker responsibilities

The worker should:

1. Pull render job from BullMQ.
2. Fetch project scene graph.
3. Generate or fetch TTS audio.
4. Build Remotion bundle if needed.
5. Render MP4.
6. Upload video to storage.
7. Update job status.

## Job statuses

```text
queued
planning
generating_voiceover
rendering
uploading
completed
failed
```

## Scaling later

When render demand grows:

```text
API server
Redis
Worker 1
Worker 2
Worker 3
Object storage
```

Do not over-engineer this on day one.
