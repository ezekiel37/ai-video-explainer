# Audio And Sound Pack System

## Audio Philosophy

For the first usable build, use mock TTS/audio and prove deterministic rendering first. Real TTS and sound packs come after the MP4 landscape render path is reliable.

This product should NOT use random AI-generated sound effects for the MVP.

The system should use:
- curated sound packs
- controlled audio systems
- reusable sound primitives
- synchronized audio events

The goal is:
- clarity
- pacing
- consistency
- emotional reinforcement

NOT cinematic production.

---

## Audio Architecture

The audio engine should have 3 primary layers:

1. Narration Layer
2. Motion FX Layer
3. Background Ambience Layer

These layers should be independently controlled.

---

## 1. Narration Layer

Primary engine:
- mock TTS/audio first
- Gemini or Google TTS after rendering is reliable

Responsibilities:
- narration playback
- scene-level timing alignment
- emphasis synchronization later

Rules:
- narration is always the primary audio
- all other layers duck slightly during narration peaks

---

## 2. Motion FX Layer

This is the most important sound layer.

Used for:
- arrow movement
- path tracing
- highlights
- zooms
- transitions
- reveals
- clicks

Examples:
- soft whoosh
- subtle click
- transition swipe
- pulse
- confirmation ping

Motion FX should feel:
- lightweight
- modern
- subtle
- informative

Avoid:
- gaming sounds
- meme sounds
- loud cinematic effects

---

## 3. Background Ambience Layer

Very subtle looping background audio.

Purpose:
- pacing
- emotional continuity
- polish

Examples:
- ambient synth
- soft tech hum
- calm educational loop

Rules:
- low volume only
- never compete with narration
- should be almost invisible emotionally

---

## Sound Packs

Sound packs should align with visual packs.

Each pack contains:
- transition sounds
- reveal sounds
- ambient loops
- narration EQ presets
- motion FX

Example structure:

packs/
  tech/
    audio/
      arrow-swipe.mp3
      ui-click.mp3
      ambient-loop.mp3

  onboarding/
    audio/
      feature-reveal.mp3
      modern-click.mp3

  education/
    audio/
      paper-transition.mp3
      soft-highlight.mp3

---

## Initial Sound Personalities

### Tech / Product
- digital clicks
- soft synth ambience
- glowing transition sounds
- subtle pulses

### SaaS Onboarding
- clean UI clicks
- smooth transitions
- modern interface sounds

### Education
- calm pacing
- lighter transitions
- softer emphasis sounds

### Business Workflow
- structured clean transitions
- minimal corporate soundscape

---

## Audio Event Model

Audio should be timeline-driven.

Example:

{
  "time": 4.2,
  "audio": "arrow-swipe-soft",
  "target": "payment-arrow",
  "volume": 0.35
}

Audio events should synchronize with:
- node highlights
- motion transitions
- narration emphasis
- scene changes

---

## Audio Rules

To prevent noisy exports:

- max simultaneous FX = 2
- background volume <= 15%
- narration priority always highest
- transition FX duration < 700ms
- avoid repetitive sound spam

---

## Technical Stack

Playback:
- Remotion audio sequences
- Web Audio API
- GSAP timeline hooks

Processing:
- FFmpeg
- audio normalization
- compression pipeline

Storage:
- MP3/WAV packs
- versioned audio assets

---

## Important Product Principle

Audio should reinforce explanations,
not distract from them.

The best sound design is often barely noticed,
but strongly felt.

---

## Long-Term Direction

Potential future improvements:
- word-level sync
- adaptive pacing
- narration-aware FX
- beat-aligned transitions
- pack marketplaces
- branded sound systems

But the MVP should remain:
- minimal
- structured
- deterministic
- consistent
