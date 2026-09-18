# MVP Scope

The first workflow is Mermaid or structured outline → editable scenes → silent animated process video. Prompt generation currently selects a fixed demo; it does not interpret arbitrary requests with an AI model.

Implemented: horizontal-flow and step-sequence layouts; card/icon shapes and directional edges; scene titles, caption/narration text, label, duration and order edits; signed-in saving/reopening; MP4 landscape/portrait and landscape GIF. Preview is public and local. Server rendering requires an account.

Imports preserve the submitted source and full node text in metadata. Long visible labels are abbreviated. Large imports are split into scenes; inputs that exceed eight scenes or 90 seconds are rejected rather than silently shortened. Mermaid supports common node wrappers and explicit connections; subgraphs and unsupported expressions require simplification.

Not yet implemented: synthesized voice, full Mermaid semantics, arbitrary diagram layouts, full animation-timeline editing, rendered callouts, billing, custom uploaded assets, themes, collaboration and brand kits. The source schema accepting a field does not by itself imply a visual implementation.

The canonical limits and stack are in [00_MVP_DECISIONS.md](00_MVP_DECISIONS.md).
