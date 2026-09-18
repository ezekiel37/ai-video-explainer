# Risks and Blind Spots

> Status: Risk register, not completed controls. For implemented fixes and remaining release gates see `ROADMAP.md` and `CODEX_HANDOFF.md`.

## Risk 1 — Output quality

Bad visuals kill this product quickly.

Users will forgive limited features.
They will not forgive messy animations.

Mitigation:
- strict templates
- limited layouts
- validation
- preview before render

## Risk 2 — Overbuilding editor features

If users can drag everything freely, the product becomes Canva-lite.

Mitigation:
- edit meaning, not pixels
- no full canvas editing in MVP
- controlled scene properties only

## Risk 3 — Render cost

Video rendering can become expensive.

Mitigation:
- queue renders
- cap video length
- cache outputs
- limit resolution for free users
- use Hetzner workers

## Risk 4 — LLM unpredictability

LLMs can produce invalid or bloated outputs.

Mitigation:
- strict schemas
- repair prompts
- max nodes
- max scenes
- fallback templates

## Risk 5 — Weak differentiation

If positioned as "AI video maker", it will be crushed by larger tools.

Mitigation:
- own "animated explanation videos"
- focus on process/system visualization
- produce examples that generic tools cannot easily match

## Risk 6 — Voiceover sync complexity

Voice sync can become a rabbit hole.

Mitigation:
- scene-level sync first
- word-level sync later
- use cue markers
- make timing adjustable

## Risk 7 — Too many domains

Supporting tech, photography, onboarding, education, and business from day one is too wide.

Mitigation:
- build generic core primitives
- launch with 2 packs only: core + tech/product
- add photography later
