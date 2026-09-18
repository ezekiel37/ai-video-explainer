# Tech Stack

| Area | Current implementation |
|---|---|
| Runtime | Node 22+, TypeScript, pnpm workspace |
| Web/API | Next.js App Router and route handlers |
| UI | React, Tailwind, Phosphor icons, Zustand, React Flow topology view |
| Validation | Zod shared scene graph |
| Data | PostgreSQL, Drizzle ORM/migrations |
| Accounts | Better Auth, email/password |
| Queue | BullMQ, Redis |
| Renderer | Remotion, React/SVG, bundled FFmpeg and headless Chrome |
| Layout | Shared hand-written deterministic placement |
| Media | Shared local directory or private R2/S3 via AWS SDK |
| Email | Optional Brevo render completion adapter |
| Deployment | Docker Compose web, worker, PostgreSQL and Redis |

Gemini planning/TTS, GSAP composition effects, Dagre/ELK, billing, auth email recovery and lifecycle marketing remain proposed work. Installed packages and an available helper are not evidence that a feature is wired into the product. No Supabase, Prisma or standalone Fastify API is used.
