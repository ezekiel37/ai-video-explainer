# ExplainMotion design context

## Product and audience
A studio for editing the meaning of short process explanations. Technical/product explainers are the launch audience. Preserve the existing light, restrained visual style while repairing reliability.

## Visual language
Runtime token owner: `apps/web/tailwind.config.ts`; global rules: `apps/web/app/globals.css`. Ink #18181b, paper #f8fafc, accent #256d5a, neutral borders. System sans body with monospace metadata. Use existing rounded panels and clear labels. No new UI framework.

## Interaction contracts
- Session and ownership policy: `00_MVP_DECISIONS.md` and server access helpers. Demo preview is public; saved projects and rendering require authentication.
- Explicit Save changes confirms server persistence. Changes have revision checks; conflicts preserve the editor. Navigation is blocked while unsaved, with Save and Discard controls. Page unload uses the browser's standard unsaved-change guard.
- Editor store owns async state, errors, active job identity and recovery. Never simulate server completion.
- Existing native inputs/buttons remain canonical. Auth forms own validation and disable duplicate submission. Native selects own project and preview-format choices; no date controls are needed.
- Render progress and form errors use labelled live regions; export actions stay stable while busy. Completed downloads are real links to owner-checked media.
- Source is preserved on its project; unsupported import content is rejected rather than silently omitted.

## Responsive and accessible behaviour
Fit preview to measured width. Rendered and preview layouts share the same stage dimensions. Keep arrows in portrait. Visible keyboard focus, reduced-motion support and native scrollbars. Inputs have associated labels; password inputs are masked.

## Verification
Typecheck all workspaces, production build, configured lint, regression tests and integration tests with PostgreSQL/Redis. Browser checks cover sign-in, source import, edits, save/reopen, failure and download when a browser is available. Do not equate static audit with runtime verification.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Native HTML select | ProjectControls and EditorShell | Project picker and preview orientation | Label, keyboard and disabled-state checks |
| Form | ProjectControls | Better Auth constraints and form validity checked by submit handler | Sign-in and registration; inline error summary | Invalid email/password, duplicate submit and network failure |
| CRUD | Editor store | Owned project API with version checks | Explicit save, discard, reopen | Regression and API integration scripts |
| Scrollbar | Browser native | Global CSS | Native platform appearance | Narrow viewport and keyboard scrolling |

Auth uses `noValidate` so the submit handler owns error display. It checks validity, focuses the first invalid input and presents the message in a linked alert. Native selects preserve keyboard interaction. There is no date, table-selection or toast system in this editor.
