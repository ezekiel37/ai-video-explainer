# ExplainMotion — Strategy

> Canonical product/business strategy. Supersedes the old business docs
> (`01_PRODUCT_BRIEF`, `20_BUSINESS_AND_GTM`, `22_MONETIZATION_AND_PACK_STRATEGY`).
> For technical contracts see `00_MVP_DECISIONS.md`, `05_SCENE_GRAPH_SCHEMA.md`, `12_API_DESIGN.md`.

## One-line product

> Turn any structured idea — a doc, a diagram, a PRD, a post — into a clean
> animated explainer you can post anywhere, and re-render the moment the idea
> changes. Flat price, no credits, no design skills, no avatars.

Working name: **ExplainMotion** (alternatives parked: FlowFrame, SceneFlow, MotionMap, Vidiagram).

## What this is / is NOT

**This IS:** light-animated explainers of *structured ideas*, generated from
text/diagrams/specs, accurate and on-brand, editable as meaning, re-renderable.

**This is NOT:**
- a general AI video generator (not Veo / Kling / Sora)
- an avatar / talking-head tool (not Synthesia / HeyGen)
- a free-form design canvas (not Canva / Figma / After Effects)
- a credit-metered "burn your budget" tool

The discipline: **stay narrow on _format_, go broad on _audience_.** The output is
always one specific thing — clean motion-graphics explainers. The audience can be
anyone who builds or writes things but cannot animate.

## The lane (why the seat is empty)

| Category | What they do | Why they don't solve this |
|---|---|---|
| Canva / Powtoon | Manual drag-drop animation | The time sink — you do all the work by hand |
| Synthesia / HeyGen | Talking-head avatars | Wrong format — a person talking, not the idea explained |
| Veo / Kling / Sora | Generative footage | Unpredictable, off-brand, can't accurately show *your* thing |
| Mermaid / draw.io | Static diagrams | No motion, no narration, not shareable as media |
| **ExplainMotion** | **Structured input → auto light-animated, accurate, editable, re-renderable explainer** | the empty seat |

The moat is the **scene graph as source of truth**: the explainer is a versionable,
re-renderable file, not a throwaway MP4. Canva can't automate it; Veo can't make it
accurate; avatar tools can't show the concept itself.

## Audiences (one job, three costumes)

The single job-to-be-done:
> "I have a real thing — a product, a feature, a concept, a post — and turning it
> into a clear animated visual is too slow, too expensive, or needs design skills
> I don't have."

| Audience | Validated pain | Their input | Where they publish |
|---|---|---|---|
| **Tech media / dev builders** (beachhead) | Diagrams go stale; no fast path from diagram → narrated video | Mermaid / diagram / spec | LinkedIn, X, HN, README, docs |
| **Founders / indie hackers** | "90% fail at distribution, not product"; can't make a product explainer without hiring | PRD / feature / product flow | Product Hunt, launch posts, landing pages |
| **Content creators** | "70% cite production time as the biggest hurdle"; demand for animated content outruns skills/budget | Blog post / script / thread | Reels, Shorts, TikTok, YouTube |

Same engine. Only the **input adapter** and **output preset** differ per audience.

## Product architecture (the synthesis)

```
        INPUT ADAPTERS  (front doors — one per audience)
   ┌─────────────┬──────────────┬──────────────┬──────────┐
   │ Mermaid /   │ PRD / feature│ Post / script│  Plain   │
   │ diagram     │ / spec       │ / thread     │  prompt  │
   └──────┬──────┴───────┬──────┴───────┬──────┴────┬─────┘
          ▼              ▼              ▼           ▼
            ┌─────────────────────────────────────┐
            │   SCENE GRAPH  (the spine / truth)   │  edit MEANING, not pixels
            │   validate → layout → light animate  │
            └─────────────────────────────────────┘
          ▲              one-click RE-RENDER
          │   change source → regenerate / reformat
          ▼
        OUTPUT FORMATS  (match where each audience publishes)
   ┌──────────┬──────────┬─────────────┬──────────────────┐
   │ 16:9 MP4 │ 9:16     │ GIF / loop  │ carousel frames  │
   │ (launch) │ (Reels)  │ (X/LI/README│ (LinkedIn/IG)    │
   └──────────┴──────────┴─────────────┴──────────────────┘

        FLAT PRICING: unlimited explainers, no credits
```

**One engine. Many doors in. Many formats out. A re-render loop wrapping it.**

### The five strategic moves (and how they fuse)

1. **Stay true to the source.** The explainer is a living artifact tied to its
   source (doc/diagram/post), not a throwaway render.
2. **Import, don't just prompt.** Input adapters are the front doors that broaden
   reach *without* broadening format. Structured imports are also more
   deterministic than freeform prompts → higher quality, lower LLM cost.
3. **Re-render on change is the product.** The pain is *maintenance & repurposing*,
   not first creation. Update the source → one click → new video / new format.
   Avatar tools structurally cannot do this; their output is opaque.
4. **Price against the trap.** Competitors' loudest complaint is credit anxiety
   ("unlimited" that burns budget 4x). Flat, no-credit pricing is a marketed feature.
5. **Narrow the beachhead, not the ceiling.** Enter through one audience; expand
   across the others on the same engine.

## Positioning & messaging

Primary line:
> **Explain what you built — visually, in minutes.** Paste your idea, doc, or
> diagram. Get a clean animated explainer you can post anywhere. No design skills,
> no editing, no avatars.

Per-audience hooks:
- Tech: *"Mermaid diagrams that explain themselves."*
- Founders: *"Your product is perfect and nobody gets it. Fix the explaining."*
- Creators: *"Animated explainers for your content — without the production time."*

Avoid: "AI Canva", "AI video generator", "make videos from text", "presentation maker".

## Pricing

Flat, no credits. Meter the **free tier by video count**, never per-minute.

| Tier | Price | Who | Gate |
|---|---|---|---|
| **Free** | $0 | trial / virality | 3 videos/mo, 720p, watermark, basic voice |
| **Pro** | **$29/mo** | solo dev / founder / creator | unlimited, 1080p, no watermark, real TTS, all formats |
| **Team** | **$99/mo** (3 seats) | product / SaaS teams | brand colors, shared library, priority render |
| **API / self-host** (later) | usage | embed in docs/pipelines | render API |

Rationale: $29 is the developer-tool impulse line; Team $99 captures the
"expense it" buyer. Render minutes cost real money (Remotion compute + TTS +
storage) — so meter free by count and keep paid flat-but-finite via fair-use.

## Design & theme principles

- Output must look **premium-minimal**, never clip-art. `minimal-tech` is the only
  v1 theme. Motion quality (easing, staggered reveals, arrow-trace synced to
  narration) *is* the product — invest there over features.
- **No avatars, no stock footage, no generative video.** Light vector / motion
  graphics only — keeps renders cheap, accurate, and out of the Veo arms race.
- Editor feels like an IDE, not Canva. **Edit meaning, not pixels** — this is why
  we can be fast and on-brand where Canva is slow.
- Themes later map to **audiences**, not decoration (`minimal-tech` → `product-flow`
  → `boardroom`). Re-theming is a re-render, not a redo.

## Go-to-market

The output is the ad. Watermarked free output → top of funnel.

1. **Beachhead — tech media / dev builders.** Mermaid → video is the most
   defensible, highest-"wow", most deterministic demo, and rides the diagram-as-code
   trend already hot on LinkedIn/HN. Launch asset: one jaw-dropping animated
   explainer of a famous system (Stripe, Uber dispatch), Show HN + Dev.to.
2. **Expand — founders / indie hackers.** Add PRD/feature adapter + GIF/launch preset.
3. **Expand — content creators.** Add post/script adapter + 9:16 preset.

Each expansion = new adapter + output preset + template pack. Not a new product.

Templates double as SEO + on-ramps: "How OAuth works", "How a payment flows",
"Feature announcement", "How it works", one landing page each.

## Tooling decisions

- **Infra: self-hosted on Hetzner/Contabo.** No Supabase. Postgres, Redis, Better Auth,
  API, and worker all run on the VPS via Docker. We accept the ops burden (backups,
  patching) in exchange for flat, predictable cost and no vendor lock-in. Keep the data
  layer vanilla Postgres so hosting stays portable.
- **DB access: Drizzle** (SQL-native, light Docker image). Replaces Prisma.
- **Auth: Better Auth** (self-hosted), emails relayed through Brevo SMTP.
- **Email: Brevo** (transactional + marketing): auth emails, render-complete
  notifications, onboarding, lifecycle. Env: `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`.
- **Media storage: Cloudflare R2** — zero egress fees, the single biggest cost lever for
  a video product. Keep it.
- **Video: Remotion** (deterministic, programmatic). Licensing: free for individuals/small
  cos, ~$25/dev/mo + $100/mo company min once commercial.
- **Animation: Remotion-native + GSAP.** Remotion `interpolate`/`spring`/`<Series>` for
  reveals/slides/fades; **GSAP for premium effects** (DrawSVG line-draw, MorphSVG morphing,
  MotionPath curved arrows, fine easing) — **frame-driven only**, free for commercial use
  since April 2025. GSAP powers presets; users never touch it.
- **TTS:** mock first; architect `voice.provider` to accept `gemini | google |
  elevenlabs` and pick on quality-per-dollar when rendering is reliable.
- **Layout:** Dagre / hand-rolled is enough for constrained layouts; defer ELK.js
  until free-graph layouts (hub-and-spoke) are needed.

## Guardrails (what keeps us narrow)

- One motion personality; never a free-form canvas.
- Edit meaning, not pixels.
- No avatars / stock / generative footage.
- One format family: structured light-animated explainers.
- Narrow the audience we *launch to*, not the audience we *can serve*.
