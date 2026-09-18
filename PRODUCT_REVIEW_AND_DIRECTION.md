# ExplainMotion: end-to-end review and proposed direction

Date: 18 September 2026.

Reviewed repository: `ezekiel37/ai-video-explainer`, branch `fix/review-hardening`, commit `519b6818a98df3e48cbe1668169a79329825d8d9`. Remote `main` still points to the original scaffold, `c156e5c274f59199e26a0432f23dd254c101ccf6`, at the time of this review.

Status: research and product/architecture proposal. Publishing this document does not implement or approve the proposed features. Current behaviour remains defined by the executable code, [README](README.md), [MVP decisions](00_MVP_DECISIONS.md) and [handoff](CODEX_HANDOFF.md). The recommendations below challenge parts of [STRATEGY](STRATEGY.md); they do not silently replace existing contracts.

## 1. Recommendation

Build a guided motion studio that turns real product assets, text and diagrams into editable, narrated videos. Give it three starting points: **Explain a process**, **Showcase a product**, and **Animate text**. Use one composition model, preset system, asset library, voice pipeline and export service underneath.

Keep the existing application and reliable job foundations. Extend the diagram model into a versioned composition document before bolting on photo uploads and text effects. Make the current diagram renderer one supported scene type inside that document.

The proposed promise is: **Turn your product, process or message into a branded animated video, then update it without starting again.** This is a positioning hypothesis to test, not a proven market advantage.

The features reinforce each other when a user can combine a product reveal, a process explanation, animated labels and narration in the same video. A collection of unrelated animation buttons would not achieve that. The reusable unit should be a complete editable scene with an intended communication purpose.

## 2. What the repository actually supports

This was a source and documentation review, with current primary-source technology research. It was not a new deployment test, visual redesign, penetration test or customer study. Earlier local verification is recorded in CODEX_HANDOFF.md and was not repeated for this documentation-only change. A connector query returned no pull-request-triggered workflow runs for the reviewed commit; that query does not establish whether push-triggered CI passed.

| Area | Evidence in the reviewed branch | Implication |
|---|---|---|
| Inputs | `packages/ai/src/index.ts` selects fixed examples; Mermaid and outline adapters are deterministic | General prompt understanding is not implemented |
| Scene contract | `packages/schema/src/index.ts` requires diagram nodes, two layouts, narration and one style | Photos and text-only compositions need a richer contract |
| Editing | `apps/web/lib/store.ts` supports explicit saves, versions, reopening and conflict handling | Preserve these protections when adding autosave and AI edits |
| Preview | `EditorShell.tsx` uses static `ScenePreview`; React Flow is a topology aid | A playable preview is a central missing product capability |
| Rendering | Remotion/SVG exports MP4 and GIF; callouts and some animation semantics remain incomplete | Supported schema vocabulary must match visible renderer capability |
| Voice and sound | Voice fields and narration text exist; no generated audio or mixer | Voice is a full pipeline to build, not a switch to enable |
| Jobs | PostgreSQL reservations, immutable graph snapshots, BullMQ transport and lease fencing | Reuse this work; production recovery still needs demonstrated tests |
| Updates | Browser polls around every 1.5 seconds with bounds/backoff; worker reconciliation runs every 15 seconds | Browser push is proposed, not already present |
| Uploads and packs | Asset package contains curated icon metadata | User media ingestion, preset installation and industry packs are absent |
| Commerce | Everyone resolves to the free plan; dormant paid entitlements allow unlimited renders | Do not expose paid plans before replacing that allowance policy |
| Operations | Compose, private media and test scripts exist | Real render, database recovery, private storage, backups and account recovery remain release gates |

Other concrete gaps: the scene schema requires at least one node and eight narration characters, so a silent text-only bumper does not fit; voice providers currently omit ElevenLabs; source updates have no three-way merge; there are no immutable asset versions or generated-audio records. The current project graph says landscape while orientation is passed separately to export. A new model should make canvas variants explicit without breaking existing jobs.

## 3. Strategic assumptions to correct

**The market is not empty.** Creatomate already documents template automation, a video/image API, frontend tooling and AI/MCP integration. Canva documents dynamic brand-template generation through its Autofill APIs, subject to Enterprise access and asset limitations. Consequently, claims such as “Canva cannot automate it” are too broad. These sources establish capabilities, not comparative output quality or customer satisfaction. [Creatomate documentation](https://creatomate.com/docs/fundamentals/getting-started/introduction), [Canva Autofill](https://www.canva.dev/docs/connect/autofill-guide/).

**A scene graph alone is not defensibility.** It is useful infrastructure. The potential advantage is a combination of understandable story planning, strong industry sequences, predictable output and reliable source updates that preserve the user's edits. Each needs evidence from actual usage.

**One engine does not imply one customer.** A founder explaining software and a merchant advertising shoes can share image/text primitives but have different acquisition channels and repeat-use needs. Recommend product teams, founders and small agencies as the first commercial hypothesis because diagrams, screenshots, product announcements and repeat revisions naturally meet there. Preserve broader creator and physical-product workflows in the design; test them separately instead of claiming universal fit.

**Preset count is a weak quality metric.** A few sequences that handle real images, long text, portrait layouts and narration gracefully are more useful than dozens that fail outside a demo. Grow the catalogue through observed demand.

**“No editing” and an IDE-like experience conflict with this direction.** Users need simple control over crop, order, emphasis and wording. Offer direct, bounded edits and a scene strip first; keep detailed timing controls available progressively. JSON should not be a prerequisite.

## 4. Compare the whole-project approaches

| Approach | Strength | Cost or limitation | Recommendation |
|---|---|---|---|
| Own guided studio on Remotion | Fits existing work; control over diagrams, presets, source changes and reproducible exports | We own layout, timing, asset handling and visual quality | Recommended foundation |
| Managed template/render API | Can reduce rendering and infrastructure work | Provider costs, supported behaviours and preview/export integration constrain the product | Benchmark with representative scenes if operating our renderer becomes the bottleneck |
| Generative video as the main engine | Useful for imaginative footage and motion beyond the supplied image | Exact labels, product identity, editability and repeatability require separate evaluation | Optional future clip source |
| General visual editor | Maximum manual control | Large interaction surface and greater user effort | Keep bounded scene controls; add advanced controls only for demonstrated needs |

This recommendation is based on fit with the repository and requested workflows. No hands-on provider bake-off was conducted, so it is not a claim that our renderer is already cheaper or visually superior.

## 5. The complete user journey

1. **Choose an outcome.** Explain a process, showcase a product, or animate text. Ask for audience, intended message and output format only where they improve the draft.
2. **Provide material.** Upload pictures/screenshots, paste text or import a diagram. Show upload/processing failures against the affected item and allow retry or replacement.
3. **Review the proposed story.** Show scene order, asset assignments, text and narration together. Distinguish source facts from suggested copy. A user must be able to skip AI and start from a preset.
4. **Apply a scene recipe and brand.** Offer moving preset previews. Let the user change image order, focal point, text, intensity, duration and sound. Recommend compatible choices rather than exposing an unrestricted effect list.
5. **Prepare voice and sound.** Accept typed narration, uploaded voiceover or recording. Let the user audition a short sample, then generate the approved scenes. Show which audio becomes stale after an edit.
6. **Preview the actual composition.** Play, pause, scrub and inspect individual scenes. Surface missing assets, unreadable text and timing conflicts before export.
7. **Export a saved revision.** Show output settings and allowance impact. Display real stage progress; support reconnect, cancellation and retry. An edit during rendering creates a newer draft without changing the in-flight export.
8. **Reuse and update.** Duplicate for another audience, language or format; replace a screenshot; revise one sentence; keep unaffected work. Offer a source-change review before applying a refresh.

Phone users should be able to upload, choose a preset, change copy, preview and export. More detailed scene timing can favour a larger screen. Preserve drafts through session expiry and weak connections; do not promise offline rendering. Reduced motion in the editor must not silently rewrite the exported video; a simpler-motion export is an explicit option.

## 6. Four pictures, Implode, sound and an industry pack

The requested example should become a reusable scene recipe with asset slots, not a hardcoded four-image video.

| Step | Proposed behaviour |
|---|---|
| Upload | Four images appear as editable slots; retain originals and create preview derivatives |
| Assign | Pick a main image, reorder the others and adjust crops; background removal is optional and independently reversible |
| Select Implode | Pictures converge inward; the selected main product remains for the final reveal |
| Add text | Headline and supporting copy appear at defined cues; users can choose word, line or character reveals |
| Add sound | A whoosh follows convergence; an impact or confirmation sound lands at the reveal; either can be muted |
| Apply industry recipe | Add a relevant process, comparison or status sequence using the same assets and brand |
| Narrate | Fit visual cues to the approved speech; allow a silent variant |
| Reformat | Reflow for portrait/landscape with explicit focal-point and text checks |

Provide variants such as implode-to-logo, implode-to-main-product and gather-into-grid. Explain their destination in the preset thumbnail. Three images should adapt to a supported arrangement; five should either use a supported variant or ask the user to choose slots. Never discard an asset silently.

Moving, cropping, masking and applying parallax to photos is feasible with a 2D composition. A physically correct exploded view or a rotation revealing unseen product surfaces requires suitable component images, 3D assets or separately generated footage. Label those capabilities distinctly rather than promising them from arbitrary photos.

## 7. Separate effects, scene recipes and industry packs

| Layer | Responsibility | Examples |
|---|---|---|
| Motion primitive | A reusable change to one element or group | Move, scale, fade, mask, path reveal, stagger, highlight |
| Effect preset | A controlled combination of primitives | Implode, orbit, stack, carousel, word reveal, counter |
| Scene recipe | An editable story beat with slots, cues and readable pacing | Product hero, comparison, payment confirmation, delivery journey |
| Industry pack | Relevant recipes, terminology, assets and sound defaults | Fintech, supply chain, SaaS onboarding, commerce |
| Brand kit | Reusable identity independent of industry | Logo, colours, fonts, voice preferences and sound choices |

Start the catalogue with recipes covering the requested families. A fintech pack could include initiation, pending, confirmation, failure and reversal. A supply-chain pack could include picking, handoff, transit, delivery and exception states. These are illustrative templates; they must not assert that a particular business operates that way without source evidence.

A money-movement animation is a visual explanation, not live financial data. A truck moving along a route is an illustration unless a future data connection explicitly supplies real tracking. Label fictional figures and examples.

Each preset needs an ID/version, compatible scene and asset types, slot counts, required fields, adjustable parameters, supported aspect ratios, timing rules, audio cue names, fallback behaviour and tested examples. Resolve conflicting effects: two presets cannot independently own the same transform at the same time. Pack assets need recorded provenance and redistribution permissions. A marketplace is a later distribution mechanism for this contract, not a prerequisite.

## 8. Use a versioned composition document

Keep the authoring document separate from the compiled render manifest. Source content, user decisions and calculated frame positions have different lifecycles.

| Part | Proposed responsibility |
|---|---|
| Sources | Original text, diagram XML and asset references, source revision and import mappings |
| Story | Audience, goal, source-backed statements, ordered scenes and narration |
| Scene content | Typed diagram, image showcase, text, comparison and screenshot-callout scenes |
| Presentation | Recipe/version, brand/version, crop/focal point, editable overrides and semantic cues |
| Audio | Persisted narration clips, transcript/alignment, music/FX references, gain and cue bindings |
| Compiled manifest | Resolved assets/fonts, layout, integer frame ranges, audio offsets and renderer version |
| Export | Immutable manifest, output settings, job state, usage reservation and output reference |

The scene variants can share typed text, image, shape, group and connector elements. Do not build an unlimited animation language or a new rendering engine before proving the representative scenes. The compiler should own geometry and frame timing. AI should select known scene types and approved parameters, never executable HTML, JavaScript, SVG markup or arbitrary asset URLs.

Use one compiled timeline for preview and export. Pin fonts, asset hashes, preset versions, random seeds and renderer versions. This aims for reproducible visual behaviour in a controlled runtime; do not promise byte-identical encoded files across different platforms.

Treat imported text and diagram labels as content, not instructions to the planner. Keep generation behind schema validation, supported-capability checks and a bounded repair budget. If a repair fails, return the source and a clear error or a faithful simple layout; never substitute an unrelated demonstration. Record what source supports each factual statement and let users inspect suggested additions.

Migration: introduce `schemaVersion`; support the current graph through an adapter; preserve old documents and render snapshots; add new scene variants incrementally; reject unknown future versions clearly. Do not migrate every existing project destructively just to add pictures.

## 9. Source updates must preserve creative work

The existing strategy promises re-rendering when source changes, but the current implementation does not merge refreshed source with manual edits.

Store stable source-to-element IDs and distinguish imported values, generated suggestions and user overrides. Compare the previous source, new source and current edited document. Keep manual crop, timing and wording changes unless the user chooses to replace them. If a source node disappears, show affected scenes and audio rather than deleting them invisibly. Use explicit remapping when an importer cannot retain IDs.

Invalidate only what changed: replacing an image should not regenerate voice; changing narration should invalidate that scene's audio/alignment; changing a font can invalidate text layout; switching aspect ratio can invalidate layout but reuse speech. Compilation and final export may still need to run for the full composition. Partial media-render caching is a later optimization, not a promise that editing one scene always renders only that scene.

## 10. draw.io: valuable input, optional MCP integration

The official `jgraph/drawio-mcp` project provides diagram creation/opening paths, including XML, CSV and Mermaid tooling. It supplies a useful authoring connection; it does not supply our animated storytelling runtime. [Official draw.io MCP](https://github.com/jgraph/drawio-mcp).

Implement native `.drawio`/XML import independently of MCP. Preserve IDs, groups, connectors, labels, geometry and original source where supported. Offer preserve-layout and presentation-layout choices. Preview unsupported shapes and embedded content, with a flatten-to-image fallback that clearly loses element-level animation. A raster screenshot cannot be assumed to contain recoverable diagram structure.

Diagram topology does not establish narration order. Ask for or propose the path to explain, including branches, failures and loops. Sanitise XML/HTML labels, bound decompression and expansion, and prevent embedded remote resources from causing arbitrary server fetches.

An embedded draw.io editor can later report edits through its documented autosave/patch messages. Validate message origin and project revision before accepting changes. MCP is optional for users already working through an assistant; it should not be required to upload a diagram. Hosted integrations also need an explicit account of which source material leaves our application. [Embed documentation](https://www.drawio.com/docs/reference/embed-mode/).

## 11. Voice and sound should determine meaningful timing

Recommended flow: approve script, generate or ingest speech, obtain alignment, resolve narration cues, compile visual timing, preview the mix, then export. Let users change scene duration or shorten copy if speech does not fit. Never truncate narration silently or speed it up automatically beyond an accepted choice.

ElevenLabs exposes speech streaming with character timing; map available alignment to words and semantic cues, and provide an editable fallback when alignment is absent. It is a strong first integration candidate for synchronization, subject to voice quality and measured cost. Gemini TTS is another candidate; current documentation marks the capability as preview. Do not assume every provider supplies equivalent timestamps. [ElevenLabs timing API](https://elevenlabs.io/docs/api-reference/text-to-speech/stream-with-timestamps), [Gemini TTS](https://ai.google.dev/gemini-api/docs/speech-generation).

Support uploaded or recorded voiceover so the product remains useful without a paid TTS call. Align it to its transcript when available. Cache generated speech by owner, normalized script, provider/model, voice, language, settings and pronunciation configuration. Preserve the generated file and timing rather than calling the provider again during rendering.

Use independent narration, sound-effect and music tracks. Default to a curated, reusable sound library; attach FX to events such as convergence or confirmation. Custom text-generated sound can be optional. ElevenLabs documents prompt-based sound effects with duration and looping controls, but generating one for every preview would add unnecessary delay and expense. [Sound API overview](https://elevenlabs.io/docs/overview/capabilities/sound-effects).

Reduce music beneath narration, prevent clipping, let users mute each layer and offer caption/transcript output. Numerical volume percentages alone do not establish intelligibility; validate mixes by listening on representative speakers/headphones. Remotion supports timeline-positioned audio and frame-based volume control. [Remotion audio](https://www.remotion.dev/docs/media/audio).

## 12. Define real time precisely

| Experience | Proposed mechanism | Important boundary |
|---|---|---|
| Changing text, crop, colour or preset | Local state, compilation and Remotion Player | Asset loading and device limits still affect responsiveness |
| Upload, TTS and render status | Authenticated SSE notifications backed by durable job state | A status event is not the completed video |
| Cross-tab project changes | Browser coordination for local tabs plus server revision events | Handle conflicts; do not overwrite unsaved work |
| Live voice commands | A realtime speech provider and validated editor commands | Distinct from the narration track saved into the video |
| Future simultaneous editing | Bidirectional transport and conflict-resolution model | SSE alone is not collaborative editing |

Remotion Player can host interactive previews. Use the same composition and resolved assets as export, and test representative frames for agreement. [Player documentation](https://www.remotion.dev/docs/player).

For status delivery, persist the job transition and an outbox event atomically. Deliver event IDs through an authenticated SSE endpoint; deduplicate, replay where retained, and resynchronise after a gap. Establish a cursor/snapshot handoff so an event between the initial read and subscription is not lost. Fetch current state on opening or reconnecting. This is recovery, not constant browser polling. Keepalives maintain the connection; they need not query the job repeatedly. [SSE behaviour](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events).

Scope every subscription to the current owner and stop it on session revocation. Coalesce progress updates and bound connections rather than forwarding every rendered frame. Show stage names and honest progress; do not represent an unmeasured queue wait as a precise completion estimate.

BullMQ QueueEvents can contribute worker notifications but should not be the only record of business completion: queue events use Redis streams with retention, while PostgreSQL owns our job outcome. The current worker writes progress to PostgreSQL; adding a listener alone would not wire those updates into the UI. Keep bounded backend reconciliation for missed dispatches and worker recovery. Removing every timer would weaken recovery. [BullMQ events](https://docs.bullmq.io/guide/events/).

Live voice can propose commands such as “slow scene two” or “replace the headline.” Route speech and buttons through the same typed command layer, with version checks, undo, cancellation and clear confirmation for destructive changes or paid generation. Gemini Live supports realtime audio and tool interactions; evaluate it for this role separately from final narration. Start with explicit push-to-talk if continuous listening adds complexity without measured benefit. [Gemini Live](https://ai.google.dev/gemini-api/docs/live-api).

## 13. Technology decisions and a correction to the earlier advice

Keep Next.js/React/TypeScript, Zod, PostgreSQL/Drizzle, Better Auth, BullMQ/Redis and private object storage. These choices already fit the workload. Do not add microservices, another database or a realtime platform merely because a feature is called real time. Web and worker can remain two deployable services with clear internal modules.

Use Remotion-native frame functions and React/SVG as the baseline motion system. Its spring primitive is frame-driven and suitable for reusable motion. Text reveals can use measured word/character spans; path reveals can use SVG stroke properties. [Remotion spring](https://www.remotion.dev/docs/spring).

**GSAP qualification:** earlier advice treated commercial availability too broadly. The current GSAP standard licence restricts certain tools that let users build visual animations without code in competition with Webflow. Its FAQ says niche tools may be permitted and invites clarification. This review does not determine ExplainMotion's legal classification. Before making GSAP a required engine, obtain written clarification for this specific product; meanwhile the native approach avoids that dependency. [GSAP licence](https://gsap.com/community/standard-license/).

If that use is cleared, the official `@remotion/gsap` adapter is worth evaluating. It seeks a paused timeline to the current frame. It was introduced in Remotion 4.0.517; our lockfile resolves 4.0.462, so it is not a drop-in addition to the current pinned renderer. Existing core packages resolve consistently today, but `remotion` has a caret range while bundler/renderer are exact. Align and pin the chosen compatible versions together during an authorized upgrade. [Official adapter](https://www.remotion.dev/docs/gsap/).

Remotion's published licence distinguishes eligible individuals/small organizations from organizations requiring a company licence, and flags upcoming version-specific changes. The price sentence in STRATEGY.md is not a reliable universal rule for this product. Confirm the applicable version, entity and use case before setting commercial economics. [Remotion licence](https://www.remotion.dev/license).

## 14. Reliability, assets and deployment

Preserve owned access, immutable exports, request idempotency and lease fencing. Extend jobs into persisted stages for asset preparation, speech, alignment, compilation and rendering. Each stage needs an input hash, attempt record, timeout and reusable result. A retry must not automatically buy the same speech twice. External provider timeouts can leave an uncertain outcome; reconcile provider IDs where supported and bound retries where they are not.

Cancellation must become a persisted state, stop useful work where possible and fence late results. Define what allowance is restored when a job is cancelled after provider costs were incurred. Keep output publication separate from completion emails so notification failures never repeat an export.

Before accepting user media, build owned asset records, upload limits, signature/type validation, decode checks, pixel/duration limits and derivatives. Store hashes, dimensions, status and asset versions. Bound SVG/XML parsing and disable external entity/resource loading. Avoid arbitrary remote URLs in render documents. A worker should render vetted assets with restricted network access and resource limits. These are new controls required by uploads, not claims about the current icon-only pipeline.

Pin assets referenced by an active export; deletion should not break an in-flight job. Retention and orphan cleanup must distinguish originals, derivatives, temporary files and published outputs. Specify how deleted accounts, exports and backups are handled.

Cache the renderer bundle by application build rather than bundling for every job as `render.ts` currently does. Pre-provision the browser and fonts. Start with measured concurrency and separate render resource limits from the API/database; one busy renderer must not exhaust the whole host. Track queue age, stage duration, peak memory, failures, provider usage and disk/object growth. Test backup restoration rather than just configuring backups.

R2 documents no egress bandwidth charge, but still charges for storage and operations. Also, the current authenticated download route proxies bytes through Next.js, so R2's pricing does not eliminate application bandwidth and connection costs. At higher volume, evaluate authorized short-lived delivery or an authenticated edge path while retaining private ownership controls. [R2 pricing](https://developers.cloudflare.com/r2/pricing/).

## 15. Business model and validation

Avoid committing to unlimited paid renders or opaque fair-use restrictions. Keep pricing understandable through an explicit export allowance with duration/resolution bounds, a visible narration allowance and separately disclosed expensive options. Local preview should not consume an export allowance. Re-downloading an existing export should not count as a new render; output variants and narration regenerations need a visible policy.

The existing $29/$99 suggestions are hypotheses. Measure cost per successful export including planning, audio, failed attempts, compute, storage/operations, delivery, applicable licences and support. Track repeated revisions and expensive users, not just a single successful demo. Free R2 egress does not prove favourable unit economics.

Run task-based pilots across the three starting points. Ask participants to bring actual material, produce something they would publish, then revise it. Compare time and quality with their existing workflow. Use founders/product teams as the primary recruitment hypothesis and separately evaluate merchants and general creators.

Proposed pilot criteria, not achieved metrics: at least five independent users complete a publishable video without the builder rescuing the session; several return with a second job or revision; participants can explain the benefit and accept a concrete paid offer. Record time to first acceptable preview, manual corrections, abandonment step, successful exports, second-project creation, actual publication and cost per accepted output. A download or compliment is weaker evidence than repeated use and payment.

## 16. Edge cases and required behaviour

| Scenario | Required outcome |
|---|---|
| Mixed image sizes or transparent backgrounds | Explicit crop/focal controls and predictable backgrounds; preserve originals |
| A preset receives too few or too many assets | Adapt within declared support or ask for a slot choice; never silently drop content |
| Very long text, missing glyphs or changed language | Reflow, choose supported fonts or surface a warning; no invisible clipping |
| Narration exceeds the requested duration | Offer a longer scene, shorter script or accepted pace change; no silent truncation |
| Voice generation fails after visuals are ready | Keep the composition; retry that stage or deliberately export silently |
| A preset changes after a project was saved | Keep the saved version; offer an explicit upgrade with preview |
| A diagram refresh removes a manually edited element | Show the conflict and affected cues; preserve recoverable edits |
| An asset changes while rendering | Continue with the immutable selected version |
| Double-click export or lost acknowledgement | Reuse the request identity and existing reservation |
| Worker crashes, Redis loses state or events are missed | Reconcile from durable records; fence stale results and avoid duplicate entitlements |
| Browser reconnects after completion | Fetch the current owned snapshot and show the existing output |
| A stale tab or voice command edits an old revision | Reject or merge with a visible conflict; support undo |
| GIF is selected with narration enabled | Explain that GIF has no audio and offer MP4 |
| Provider, font or asset is unavailable | Identify the dependency and retain the draft; do not substitute silently |
| Industry template implies unsupported claims | Mark examples and request user-supplied facts before presenting them as real |

## 17. Delivery sequence with acceptance gates

These phases preserve the full vision while sequencing shared dependencies. They are proposed work, not a commitment to a fixed delivery date.

| Phase | Deliverable | Exit evidence |
|---|---|---|
| 0. Prove the existing foundation | Review branch CI/staging, database/worker smoke render, ownership, recovery and dependency/licence decisions | Real downloadable MP4; two-account isolation; demonstrated failure/retry recovery |
| 1. Shared composition and live preview | Versioned document, legacy diagram adapter, typed scenes, preset registry and Player | Existing projects still open; text/image/diagram scenes preview and render consistently |
| 2. Complete representative workflows | Four-image implode recipe; animated text recipe; narrated diagram; basic brand kit; curated FX; SSE status | Each can be saved, reopened, revised and exported in supported aspect ratios |
| 3. Source and industry depth | Native draw.io import, source-change review, fintech and supply-chain recipes | Meaning survives import/update; exceptions and unsupported content are visible |
| 4. Paid operation and assisted control | Measured allowances/billing, recovery/retention, then validated voice commands | Costs and entitlements survive retries; voice edits are understandable and undoable |
| 5. Evidence-led expansion | Additional packs, languages, collaboration, automation/API and optional generated clips | Each addition solves a measured workflow and respects the shared contracts |

Voice narration, product motion and text motion belong in the first complete product experience. Live voice editing is a separate interaction feature that can follow once the command system is reliable. draw.io/MCP can extend acquisition and authoring without blocking uploaded images or typed text.

Testing should cover risky boundaries rather than every cosmetic property: legacy migration, preset compatibility, source-edit preservation, cue timing, preview/export agreement, duplicate submissions, reconnects, cancellation and private asset access. Use representative projects containing dense diagrams, long text, mixed images, portrait variants and multilingual narration. Listen to final exports as well as examining frames. No runtime checks were added or reported as passed by this review.

## 18. Documentation and next authorized work

If this direction is adopted, update STRATEGY.md's audience, automation/competitor claims, positioning and pricing assumptions; update ROADMAP.md with the agreed sequence; then revise schema, asset and audio contracts together. Keep current implementation status separate from target architecture throughout. In particular, older audio guidance that excludes generated FX and older scope guidance that excludes uploads should be explicitly amended when those proposals become agreed work.

The next implementation unit should prove one shared composition containing uploaded images, editable animated text and a diagram scene, with playable preview and reusable narrated timing. First satisfy the existing real-render/staging gate; then introduce this unit through a compatible schema migration. Completing a catalogue of effects before proving that loop would put effort into the wrong dependency.

This commit records the review and proposed feature plan only. It does not change application code, install dependencies, enable paid providers, merge the review branch or deploy the product.
