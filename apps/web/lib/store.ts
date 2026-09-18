"use client";
import { create } from "zustand";
import { contentToSceneGraph, generateMockSceneGraph } from "@explainmotion/ai";
import { sceneGraphSchema, type SceneGraph } from "@explainmotion/schema";
import type { RenderJobSnapshot } from "@explainmotion/shared";
import * as api from "./api";

const DEMO_ID = "4b83f3c8-95a6-4ed0-9e89-53edac5b28c4";
const DEFAULT_PROMPT = "Explain how a user sends money from User A to User B in a fintech app.";
const DEFAULT_DIAGRAM = "flowchart LR\n U[User] -->|submits| API[API Server]\n API -->|verify| Auth{Auth Service}\n Auth -->|ok| DB[(Ledger Database)]\n DB --> Notify([Notification])";
const demo = () => generateMockSceneGraph(DEMO_ID, DEFAULT_PROMPT);
type RenderState = Omit<Partial<RenderJobSnapshot>, "status" | "progress"> & { status: "idle" | RenderJobSnapshot["status"]; progress: number };
type PendingRender = api.RenderOptions & { requestId: string; version: number; projectId: string };
type State = {
  userId: string | null; lastUserId?: string; prompt: string; mermaid: string; source: string; sourceType: "prompt" | "import";
  savedSource: string; savedSourceType: "prompt" | "import";
  graph: SceneGraph; savedGraph: SceneGraph | null; projectId?: string; version?: number;
  selectedSceneId: string; projects: api.ProjectSummary[]; dirty: boolean; sourceDirty: boolean;
  busy: boolean; pollError?: string; error?: string; notice?: string; render: RenderState; pendingRender?: PendingRender;
  setSessionUser: (id: string | null) => Promise<void>;
  setPrompt: (value: string) => void; setMermaid: (value: string) => void;
  generate: () => void; importDiagram: () => void; selectScene: (id: string) => void;
  updateScene: (id: string, patch: { title?: string; narration?: string; durationSeconds?: number }) => void;
  updateNodeLabel: (scene: string, node: string, label: string) => void; moveScene: (id: string, direction: "up" | "down") => void;
  save: () => Promise<boolean>; openProject: (id: string) => Promise<void>; newProject: () => void;
  discard: () => void; startRender: (options?: Partial<api.RenderOptions>) => Promise<void>; refreshProjects: () => Promise<void>;
  resumeRender: () => void;
};
let pollGeneration = 0;
const message = (error: unknown) => error instanceof Error ? error.message : "The request could not be completed. Try again.";
function rememberProject(id?: string) {
  const url = new URL(window.location.href); if (id) url.searchParams.set("project", id); else url.searchParams.delete("project");
  window.history.replaceState({}, "", url);
}
function changedGraph(state: State, graph: SceneGraph) { return { graph, dirty: true, error: undefined, notice: undefined }; }
export const useEditorStore = create<State>((set, get) => ({
  userId: null, prompt: DEFAULT_PROMPT, mermaid: DEFAULT_DIAGRAM, source: DEFAULT_PROMPT, sourceType: "prompt",
  graph: demo(), savedGraph: null, savedSource: DEFAULT_PROMPT, savedSourceType: "prompt", selectedSceneId: "scene_01", projects: [], dirty: false, sourceDirty: false, busy: false,
  render: { status: "idle", progress: 0 },
  setSessionUser: async userId => {
    if (get().userId === userId) return;
    pollGeneration++;
    const previous = get().lastUserId;
    const hasEdits = get().dirty || get().sourceDirty;
    set({ userId, lastUserId: userId ?? previous, projects: [], busy: false, pollError: undefined, error: !userId && hasEdits ? "Your session ended. Sign in again to save your edits." : undefined });
    if ((!userId && !hasEdits) || (userId && previous && userId !== previous)) {
      set({ graph: demo(), savedGraph: null, savedSource: DEFAULT_PROMPT, savedSourceType: "prompt", projectId: undefined, version: undefined, dirty: false, sourceDirty: false, pendingRender: undefined, source: DEFAULT_PROMPT, sourceType: "prompt", prompt: DEFAULT_PROMPT, mermaid: DEFAULT_DIAGRAM, render: { status: "idle", progress: 0 } });
      if (!userId) rememberProject();
    }
    if (userId) {
      await get().refreshProjects();
      const id = new URL(window.location.href).searchParams.get("project");
      if (id && !get().dirty) await get().openProject(id);
    }
  },
  refreshProjects: async () => {
    const owner = get().userId; if (!owner) return;
    try { const projects = await api.listProjects(); if (get().userId === owner) set({ projects }); }
    catch (error) { if (get().userId === owner) set({ error: message(error) }); }
  },
  setPrompt: prompt => { if (!get().busy) set({ prompt, sourceDirty: true }); },
  setMermaid: mermaid => { if (!get().busy) set({ mermaid, sourceDirty: true }); },
  generate: () => {
    if (get().busy) return;
    const { prompt, projectId } = get();
    if (prompt.trim().length < 10) { set({ error: "Write at least ten characters for the demo prompt." }); return; }
    const graph = generateMockSceneGraph(projectId ?? DEMO_ID, prompt);
    set({ ...changedGraph(get(), graph), source: prompt, sourceType: "prompt", sourceDirty: false, selectedSceneId: graph.scenes[0].id, notice: "Demo planner: this uses a fixed example, not AI generation." });
  },
  importDiagram: () => {
    if (get().busy) return;
    try {
      const { mermaid, projectId } = get();
      if (mermaid.length > 20000) throw new Error("Keep the input under 20,000 characters.");
      const graph = contentToSceneGraph(projectId ?? DEMO_ID, mermaid);
      set({ ...changedGraph(get(), graph), source: mermaid, sourceType: "import", sourceDirty: false, selectedSceneId: graph.scenes[0].id });
    } catch (error) { set({ error: message(error) }); }
  },
  selectScene: selectedSceneId => set({ selectedSceneId }),
  updateScene: (id, patch) => { if (!get().busy) set(changedGraph(get(), { ...get().graph, scenes: get().graph.scenes.map(scene => scene.id === id ? { ...scene, ...patch } : scene) })); },
  updateNodeLabel: (sceneId, nodeId, label) => { if (!get().busy) set(changedGraph(get(), { ...get().graph, scenes: get().graph.scenes.map(scene => scene.id === sceneId ? { ...scene, nodes: scene.nodes.map(node => node.id === nodeId ? { ...node, label } : node) } : scene) })); },
  moveScene: (id, direction) => {
    if (get().busy) return;
    const scenes = [...get().graph.scenes]; const index = scenes.findIndex(scene => scene.id === id); const next = index + (direction === "up" ? -1 : 1);
    if (index < 0 || next < 0 || next >= scenes.length) return;
    [scenes[index], scenes[next]] = [scenes[next], scenes[index]];
    set(changedGraph(get(), { ...get().graph, scenes }));
  },
  save: async () => {
    const state = get();
    if (state.busy) return false;
    if (!state.userId) { set({ error: "Sign in to save your project." }); return false; }
    if (state.sourceDirty) { set({ error: "Apply your source changes with Generate scenes or Import before saving." }); return false; }
    if (!state.dirty && state.projectId) return true;
    const validated = sceneGraphSchema.safeParse(state.graph);
    if (!validated.success) { set({ error: validated.error.issues.map(issue => issue.message).join(" ") }); return false; }
    set({ busy: true, error: undefined, notice: undefined });
    try {
      let id = state.projectId; let version = state.version;
      if (!id) {
        const created = await api.createProject({ title: state.graph.title, prompt: state.source, sourceType: state.sourceType });
        id = created.id; version = created.version;
        if (get().userId !== state.userId) return false;
        set({ projectId: id, version }); rememberProject(id);
      }
      const graph = { ...validated.data, projectId: id };
      const saved = await api.saveSceneGraph(id, { version: version!, sceneGraph: graph, prompt: state.source, sourceType: state.sourceType });
      if (get().userId !== state.userId) return false;
      set({ graph, savedGraph: structuredClone(graph), savedSource: state.source, savedSourceType: state.sourceType, version: saved.version, dirty: false, notice: "Changes saved." });
      await get().refreshProjects(); return true;
    } catch (error) { if (get().userId === state.userId) set({ error: message(error) }); return false; }
    finally { if (get().userId === state.userId) set({ busy: false }); }
  },
  openProject: async id => {
    if (get().dirty || get().sourceDirty || get().busy) { set({ error: "Save or discard your changes before switching projects." }); return; }
    const owner = get().userId; const operation = ++pollGeneration;
    set({ busy: true, error: undefined, pollError: undefined });
    try {
      const project = await api.getProject(id);
      if (owner !== get().userId || operation !== pollGeneration) return;
      const graph = project.sceneGraph ?? generateMockSceneGraph(id, project.prompt);
      set({ projectId: id, version: project.version, graph, savedGraph: project.sceneGraph ? structuredClone(graph) : null, source: project.prompt, sourceType: project.sourceType, savedSource: project.prompt, savedSourceType: project.sourceType,
        prompt: project.sourceType === "prompt" ? project.prompt : DEFAULT_PROMPT, mermaid: project.sourceType === "import" ? project.prompt : DEFAULT_DIAGRAM,
        selectedSceneId: graph.scenes[0].id, dirty: !project.sceneGraph, sourceDirty: false, pendingRender: undefined, notice: project.sceneGraph ? undefined : "This project has no saved scenes yet. Generate or import your scenes, then save.",
        render: project.latestRender ?? { status: "idle", progress: 0 } });
      rememberProject(id); get().resumeRender();
    } catch (error) { if (owner === get().userId) set({ error: message(error) }); }
    finally { if (owner === get().userId) set({ busy: false }); }
  },
  newProject: () => {
    if (get().dirty || get().sourceDirty || get().busy) { set({ error: "Save or discard your changes before starting another project." }); return; }
    pollGeneration++; rememberProject();
    set({ graph: demo(), savedGraph: null, savedSource: DEFAULT_PROMPT, savedSourceType: "prompt", projectId: undefined, version: undefined, prompt: DEFAULT_PROMPT, mermaid: DEFAULT_DIAGRAM, source: DEFAULT_PROMPT, sourceType: "prompt", sourceDirty: false, selectedSceneId: "scene_01", render: { status: "idle", progress: 0 }, pendingRender: undefined, pollError: undefined, notice: undefined, error: undefined });
  },
  discard: () => {
    if (get().busy) return;
    const state = get();
    set({ graph: state.savedGraph ? structuredClone(state.savedGraph) : demo(), dirty: false, sourceDirty: false, source: state.savedSource, sourceType: state.savedSourceType, prompt: state.savedSourceType === "prompt" ? state.savedSource : DEFAULT_PROMPT, mermaid: state.savedSourceType === "import" ? state.savedSource : DEFAULT_DIAGRAM, error: undefined, notice: "Unsaved edits discarded." });
  },
  startRender: async (options = {}) => {
    if (get().busy) return;
    if (!get().userId) { set({ error: "Sign in to render a video. You can preview scenes without an account." }); return; }
    if (["queued", "rendering", "uploading"].includes(get().render.status)) { set({ error: "Your current render is still running. Use Check status to reconnect." }); return; }
    if (!get().pendingRender && !await get().save()) return;
    const owner = get().userId;
    const pending = get().pendingRender ?? { projectId: get().projectId!, version: get().version!, requestId: crypto.randomUUID(), format: options.format ?? "mp4", orientation: options.orientation ?? "landscape" };
    set({ busy: true, error: undefined, pendingRender: pending });
    try {
      const job = await api.startRenderJob(pending.projectId, pending);
      if (owner !== get().userId) return;
      set({ render: job, pendingRender: undefined }); get().resumeRender();
    } catch (error) {
      if (owner === get().userId) set({ error: error instanceof api.ApiError ? error.message : "Could not confirm render submission. Retry uses the same request ID and will not count twice.", pendingRender: error instanceof api.ApiError && error.status < 500 ? undefined : pending });
    } finally { if (owner === get().userId) set({ busy: false }); }
  },
  resumeRender: () => {
    const id = get().render.id;
    if (!id || ["completed", "failed"].includes(get().render.status)) return;
    const generation = ++pollGeneration;
    set({ pollError: undefined });
    let failures = 0; let checks = 0;
    const poll = async () => {
      if (generation !== pollGeneration) return;
      try {
        const result = await api.getRenderJob(id);
        if (generation !== pollGeneration) return;
        set({ render: result, pollError: result.status === "failed" ? result.errorMessage : undefined }); failures = 0;
        if (["completed", "failed"].includes(result.status)) return;
      } catch (error) {
        if (generation !== pollGeneration) return;
        failures++;
        if (failures >= 3 || error instanceof api.ApiError && [401, 403, 404].includes(error.status)) {
          set({ pollError: "Status updates stopped. Your job may still be running. Sign in if needed, then use Check status." }); return;
        }
      }
      if (++checks >= 600) { set({ pollError: "This render is taking longer than expected. Use Check status to reconnect." }); return; }
      window.setTimeout(() => void poll(), failures ? 1500 * 2 ** failures : 1500);
    };
    void poll();
  }
}));
