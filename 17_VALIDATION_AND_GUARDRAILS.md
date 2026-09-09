# Validation and Guardrails

## Why guardrails matter

This product fails if outputs are messy.

The system must reject or repair bad scene graphs before rendering.

## Validation categories

### Structural validation

- valid JSON
- schema compliance
- all required fields present
- all node IDs unique
- all edge references valid

### Layout validation

- max 8 nodes per scene
- max label length
- no scene with too many edges
- no unsupported layout type
- no unsupported primitive type

### Animation validation

- animation target exists
- start time is valid
- duration is valid
- no negative timing
- no scene exceeds duration limit

### Narration validation

- narration exists
- narration is short enough
- narration matches scene
- no empty scenes

## Repair loop

```text
Generate scene graph
  ↓
Validate
  ↓
If invalid: send validation errors to repair prompt
  ↓
Validate again
  ↓
If still invalid: fallback to safe template
```

## Safe fallback

If AI generation fails, create a simple step sequence:

```text
Step 1 → Step 2 → Step 3 → Step 4
```

This prevents blank outputs.
