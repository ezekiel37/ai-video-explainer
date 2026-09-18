"use client";

import { ArrowDown, ArrowUp, CheckCircle, FilmSlate, Play, Sparkle, Stack, Warning } from "@phosphor-icons/react";
import { ScenePreview } from "@explainmotion/renderer";
import { validateSceneGraph } from "@explainmotion/schema";
import { useEditorStore } from "@/lib/store";
import { ProjectControls } from "./ProjectControls";
import { useState } from "react";
import { SceneFlowPreview } from "./SceneFlowPreview";

const statusLabels = {
  idle: "Ready",
  queued: "Queued",
  planning: "Planning",
  generating_voiceover: "Audio mock",
  rendering: "Rendering",
  uploading: "Uploading",
  completed: "Complete",
  failed: "Failed"
};

export function EditorShell() {
  const {
    busy, pendingRender, resumeRender,
    prompt,
    mermaid,
    graph,
    selectedSceneId,
    render,
    setPrompt,
    setMermaid,
    generate,
    importDiagram,
    selectScene,
    updateScene,
    updateNodeLabel,
    moveScene,
    startRender
  } = useEditorStore();
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const rendering = ["queued", "rendering", "uploading"].includes(render.status);
  const selectedScene = graph.scenes.find((scene) => scene.id === selectedSceneId) ?? graph.scenes[0];
  const validation = validateSceneGraph(graph);
  const totalDuration = graph.scenes.reduce((total, scene) => total + scene.durationSeconds, 0);

  return (
    <main className="min-h-[100dvh] px-4 py-4 text-ink md:px-6 md:py-6">
      <ProjectControls />
      {pendingRender && <button className="mx-auto mb-4 block rounded-md bg-accent px-4 py-2 text-white" disabled={busy} onClick={() => void startRender()}>Retry render submission</button>}
      <fieldset disabled={busy || !!pendingRender} className="min-w-0 border-0 p-0">
      <div className="mx-auto grid max-w-[1500px] gap-4 xl:grid-cols-[330px_minmax(0,1fr)_360px]">
        <aside className="rounded-lg border border-zinc-200/80 bg-white/90 p-4 shadow-diffusion">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase text-zinc-500">ExplainMotion</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">MVP Studio</h1>
            </div>
            <span className="rounded-md border border-emerald-900/15 bg-emerald-50 px-2 py-1 font-mono text-xs text-accent">
              {orientation}
            </span>
          </div>

          <label className="mt-6 grid gap-2">
            <span className="text-sm font-medium">Explanation prompt</span>
            <textarea
              maxLength={20000}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-40 resize-none rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm leading-relaxed outline-none transition focus:border-accent focus:bg-white"
            />
            <span className="text-xs text-zinc-500">Mock planner supports money-transfer and onboarding demos.</span>
          </label>

          <button
            type="button"
            onClick={generate}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <Sparkle size={17} weight="bold" />
            Generate demo scenes
          </button>

          <label className="mt-5 grid gap-2">
            <span className="text-sm font-medium">Or paste a diagram or outline</span>
            <textarea
              maxLength={20000}
              value={mermaid}
              onChange={(event) => setMermaid(event.target.value)}
              spellCheck={false}
              className="min-h-32 resize-none rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-relaxed outline-none transition focus:border-accent focus:bg-white"
            />
            <span className="text-xs text-zinc-500">Mermaid flowcharts or a PRD / post outline (headings + bullets) become scenes.</span>
          </label>

          <button
            type="button"
            onClick={importDiagram}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-3 text-sm font-semibold text-ink hover:border-ink/30"
          >
            <Stack size={16} weight="bold" />
            Import
          </button>

          <div className="mt-6 border-t border-zinc-200 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Scenes</h2>
              <span className="font-mono text-xs text-zinc-500">{graph.scenes.length} scenes</span>
            </div>

            <div className="mt-3 grid gap-2">
              {graph.scenes.map((scene, index) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => selectScene(scene.id)}
                  className={`grid rounded-md border p-3 text-left ${
                    scene.id === selectedSceneId
                      ? "border-accent bg-emerald-50/70"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <span className="font-mono text-xs text-zinc-500">Scene {index + 1}</span>
                  <span className="mt-1 text-sm font-semibold">{scene.title}</span>
                  <span className="mt-1 text-xs text-zinc-500">{scene.layout}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="grid gap-4">
          <div className="rounded-lg border border-zinc-200/80 bg-white/90 p-4 shadow-diffusion">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase text-zinc-500">Scene graph preview</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">{selectedScene?.title}</h2>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {validation.success ? (
                  <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-accent">
                    <CheckCircle size={17} weight="bold" />
                    Valid graph
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-red-700">
                    <Warning size={17} weight="bold" />
                    Needs fixes
                  </span>
                )}
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2 text-sm">Preview format<select className="rounded-md border p-2" value={orientation} onChange={event => setOrientation(event.target.value as typeof orientation)}><option value="landscape">Landscape 16:9</option><option value="portrait">Portrait 9:16</option></select></label>
            {!validation.success && <ul role="alert" className="mt-3 text-sm text-red-700">{validation.error.issues.map((issue, index) => <li key={index}>{issue.path.join(".")}: {issue.message}</li>)}</ul>}
            <div className="mt-4 grid min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-paper">
              <div className="min-w-0 p-2">
                {selectedScene ? <ScenePreview orientation={orientation} scene={selectedScene} activeNodeId={selectedScene.nodes[0]?.id} /> : null}
              </div>
              <div className="min-h-[360px] border-t border-zinc-200 bg-white lg:border-l lg:border-t-0">
                {selectedScene ? <SceneFlowPreview scene={selectedScene} /> : null}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
            <div className="rounded-lg border border-zinc-200/80 bg-white/90 p-4">
              <div className="flex items-center gap-2">
                <Stack size={18} weight="bold" />
                <h3 className="text-sm font-semibold">Project details</h3>
              </div>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2">
                  <dt className="text-zinc-500">Style</dt>
                  <dd className="font-medium">{graph.style}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2">
                  <dt className="text-zinc-500">Format</dt>
                  <dd className="font-medium">{graph.format}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2">
                  <dt className="text-zinc-500">Duration</dt>
                  <dd className="font-medium">{totalDuration}s</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Audio</dt>
                  <dd className="font-medium">Silent (voiceover planned)</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-zinc-200/80 bg-white/90 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FilmSlate size={18} weight="bold" />
                  <h3 className="text-sm font-semibold">Render job</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={rendering || !validation.success}
                    onClick={() => startRender({ format: "mp4", orientation: "landscape" })}
                    className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-[#1f5f4f]"
                  >
                    <Play size={15} weight="bold" />
                    MP4 16:9
                  </button>
                  <button
                    type="button"
                    disabled={rendering || !validation.success}
                    onClick={() => startRender({ format: "mp4", orientation: "portrait" })}
                    className="inline-flex items-center gap-1 rounded-md border border-accent/30 bg-white px-3 py-2 text-sm font-semibold text-accent hover:border-accent"
                  >
                    9:16
                  </button>
                  <button
                    type="button"
                    disabled={rendering || !validation.success}
                    onClick={() => startRender({ format: "gif", orientation: "landscape" })}
                    className="inline-flex items-center gap-1 rounded-md border border-accent/30 bg-white px-3 py-2 text-sm font-semibold text-accent hover:border-accent"
                  >
                    GIF
                  </button>
                </div>
              </div>

              <div role="progressbar" aria-label="Render progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={render.progress} className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full bg-accent transition-all duration-500" style={{ width: `${render.progress}%` }} />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium">{statusLabels[render.status]}</span>
                <span className="font-mono text-zinc-500">{render.progress}%</span>
              </div>

              {rendering && <button type="button" className="mt-3 rounded-md border px-3 py-2 text-sm" onClick={resumeRender}>Check status</button>}
              {render.outputUrl ? (
                <a className="mt-3 block rounded-md bg-emerald-50 p-3 text-sm font-semibold text-accent underline" href={`${render.outputUrl}?download=1`}>Download completed render</a>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="rounded-lg border border-zinc-200/80 bg-white/90 p-4 shadow-diffusion">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase text-zinc-500">Meaning editor</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">Scene details</h2>
            </div>
            {selectedScene ? (
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Move scene up"
                  onClick={() => moveScene(selectedScene.id, "up")}
                  className="grid size-9 place-items-center rounded-md border border-zinc-200 hover:border-zinc-300"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Move scene down"
                  onClick={() => moveScene(selectedScene.id, "down")}
                  className="grid size-9 place-items-center rounded-md border border-zinc-200 hover:border-zinc-300"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            ) : null}
          </div>

          {selectedScene ? (
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Scene title</span>
                <input
                  value={selectedScene.title}
                  onChange={(event) => updateScene(selectedScene.id, { title: event.target.value })}
                  className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-accent focus:bg-white"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Narration</span>
                <textarea
                  value={selectedScene.narration}
                  onChange={(event) => updateScene(selectedScene.id, { narration: event.target.value })}
                  className="min-h-28 resize-none rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm leading-relaxed outline-none focus:border-accent focus:bg-white"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Pacing</span>
                <input
                  type="number"
                  min={4}
                  max={15}
                  value={selectedScene.durationSeconds}
                  onChange={(event) => updateScene(selectedScene.id, { durationSeconds: Number(event.target.value) })}
                  className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-accent focus:bg-white"
                />
              </label>

              <div className="border-t border-zinc-200 pt-4">
                <h3 className="text-sm font-semibold">Labels</h3>
                <div className="mt-3 grid gap-3">
                  {selectedScene.nodes.map((node) => (
                    <label key={node.id} className="grid gap-2">
                      <span className="font-mono text-xs uppercase text-zinc-500">{node.type}</span>
                      <input
                        value={node.label}
                        onChange={(event) => updateNodeLabel(selectedScene.id, node.id, event.target.value)}
                        className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-accent focus:bg-white"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-md border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
              Generate scenes to edit the explainer structure.
            </div>
          )}
        </aside>
      </div>
      </fieldset>
    </main>
  );
}
