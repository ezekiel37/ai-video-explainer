# MVP Scope

## MVP goal

Build a working prototype that can generate a 30–90 second animated explanation video from a prompt.

For canonical build decisions, see `00_MVP_DECISIONS.md`.

## Supported video type in v1

Start with one category:

**Process explainer videos**

Examples:

- how money transfer works
- how user onboarding works
- how an API request moves through services
- how a customer support workflow works
- how an order moves from checkout to delivery

## Supported layouts

Only support these for the first usable build:

1. Horizontal flow
2. Step-by-step sequence

Defer these until after the first render path is reliable:

- Vertical flow
- Hub-and-spoke
- Before/after comparison

Do not support arbitrary diagrams yet.

## Supported primitives

- card
- box
- label
- arrow
- avatar
- icon
- badge
- progress bar
- highlight ring
- callout
- checkmark
- warning marker

## Supported animation presets

- fade in
- slide in
- pulse
- highlight
- arrow trace
- path movement
- zoom focus
- scene cut
- scene pan
- success reveal

## Export formats

MVP:

- MP4 landscape 16:9

Later:

- MP4 vertical 9:16
- GIF
- WebM
- transparent overlay
- SVG/Lottie export

## Deliberately excluded from MVP

- real-time collaborative editing
- marketplace
- custom user-uploaded SVGs
- brand kits
- full timeline editor
- manual path editing
- multiple animation styles
- complex character animation
- AI-generated images
- AI-generated arbitrary layouts
- photography-specific packs
- education-specific packs
- business-specific packs
