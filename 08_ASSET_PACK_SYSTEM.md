# Asset Pack System

> Status: Design proposal. The current implementation uses curated metadata and inline icon/shape rendering. Pack installation, uploads and an asset marketplace are not implemented.

## Why asset packs matter

Asset packs prevent the LLM from inventing inconsistent visuals.

The LLM should choose from approved components.

## Asset pack structure

```text
/assets/packs/
  core/
    icons/
    avatars/
    arrows/
    cards/
    themes/
  tech-product/
  education/      # post-MVP
  business/       # post-MVP
  photography/    # post-MVP
```

## Asset metadata

Each asset should have metadata:

```json
{
  "id": "tech/api-server",
  "name": "API Server",
  "type": "icon",
  "tags": ["api", "backend", "server", "request"],
  "compatibleNodeTypes": ["service-card", "icon-card"]
}
```

## Core pack

Must include:

- user avatar
- team avatar
- mobile device
- laptop
- browser window
- server
- database
- cloud
- lock
- warning
- checkmark
- arrow
- queue
- payment card
- camera
- light source
- image/photo
- message
- notification

## MVP domain pack

### Tech/product pack

- API gateway
- auth service
- database
- cache
- queue
- worker
- webhook
- cloud function
- log stream
- monitoring dashboard
- signup form
- welcome screen
- checklist
- progress step
- tooltip
- success state
- user profile
- notification

## Post-MVP domain packs

### Photography pack

- camera
- lens
- subject
- key light
- fill light
- background
- reflector
- aperture icon
- shutter icon
- ISO icon

### Business workflow pack

- customer
- staff
- invoice
- approval
- dashboard
- delivery
- email
- CRM
- calendar

## Excalidraw-style inspiration

Use simple rough-looking shapes if desired, but do not copy proprietary assets directly.

Build your own visual primitives inspired by the clarity of hand-drawn diagrams.
