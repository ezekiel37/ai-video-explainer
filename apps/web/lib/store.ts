"use client";

import { create } from "zustand";
import { contentToSceneGraph, generateMockSceneGraph } from "@explainmotion/ai";
import type { SceneGraph } from "@explainmotion/schema";
import type { RenderJobStatus } from "@explainmotion/shared";
import { createProject, getRenderJob, importMermaid, planProject, saveSceneGraph, startRenderJob } from "./api";

type RenderState = {
  status: "idle" | RenderJobStatus;
  progress: number;
  outputUrl?: string;
};

type EditorState = {
  prompt: string;
  mermaid: string;
  graph: SceneGraph;
  projectId?: string;
  selectedSceneId: string;
  render: RenderState;
  setPrompt: (prompt: string) => void;
  setMermaid: (mermaid: string) => void;
  generate: () => void;
  importDiagram: () => void;
  selectScene: (sceneId: string) => void;
  updateScene: (sceneId: string, patch: { title?: string; narration?: string; durationSeconds?: number }) => void;
  updateNodeLabel: (sceneId: string, nodeId: string, label: string) => void;
  moveScene: (sceneId: string, direction: "up" | "down") => void;
  startRender: (options?: { format?: "mp4" | "gif"; orientation?: "landscape" | "portrait" }) => void;
};

const LOCAL_PROJECT_ID = "4b83f3c8-95a6-4ed0-9e89-53edac5b28c4";

const defaultPrompt =
  "Explain how a user sends money from User A to User B in a fintech app. Show the app, backend checks, ledger update, notification, and final success state.";

const defaultMermaid = `flowchart LR
  U[User] -->|submits| API[API Server]
  API -->|verify| Auth{Auth Service}
  Auth -->|ok| DB[(Ledger Database)]
  DB --> Notify([Notification])
  Notify --> Done((Success))`;

const initialGraph = generateMockSceneGraph(LOCAL_PROJECT_ID, defaultPrompt);

function deriveTitle(prompt: string): string {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed || "Untitled explainer";
}

/** Offline fallback so the editor still works when the API/Redis aren't running. */
function simulateRender(apply: (render: RenderState) => void) {
  const sequence: RenderState[] = [
    { status: "queued", progress: 8 },
    { status: "planning", progress: 24 },
    { status: "generating_voiceover", progress: 42 },
    { status: "rendering", progress: 68 },
    { status: "uploading", progress: 88 },
    { status: "completed", progress: 100, outputUrl: "/render-output/mock-explainer.mp4" }
  ];
  sequence.forEach((snapshot, index) => {
    window.setTimeout(() => apply(snapshot), index * 520);
  });
}

export const useEditorStore = create<EditorState>((set, get) => ({
  prompt: defaultPrompt,
  mermaid: defaultMermaid,
  graph: initialGraph,
  projectId: undefined,
  selectedSceneId: initialGraph.scenes[0]?.id ?? "scene_01",
  render: {
    status: "idle",
    progress: 0
  },
  setPrompt: (prompt) => set({ prompt }),
  setMermaid: (mermaid) => set({ mermaid }),
  importDiagram: async () => {
    const diagram = get().mermaid.trim();
    if (!diagram) return;
    try {
      const created = await createProject({ title: "Imported diagram", prompt: "Imported from a Mermaid diagram." });
      const planned = await importMermaid(created.projectId, diagram);
      set({
        graph: planned.sceneGraph,
        projectId: created.projectId,
        selectedSceneId: planned.sceneGraph.scenes[0]?.id ?? "scene_01",
        render: { status: "idle", progress: 0 }
      });
    } catch (error) {
      console.warn("API import unavailable — parsing locally.", error);
      try {
        const graph = contentToSceneGraph(LOCAL_PROJECT_ID, diagram);
        set({
          graph,
          projectId: undefined,
          selectedSceneId: graph.scenes[0]?.id ?? "scene_01",
          render: { status: "idle", progress: 0 }
        });
      } catch (parseError) {
        console.error("Could not parse the diagram:", parseError);
      }
    }
  },
  generate: async () => {
    const prompt = get().prompt;
    try {
      const created = await createProject({ title: deriveTitle(prompt), prompt });
      const planned = await planProject(created.projectId);
      set({
        graph: planned.sceneGraph,
        projectId: created.projectId,
        selectedSceneId: planned.sceneGraph.scenes[0]?.id ?? "scene_01",
        render: { status: "idle", progress: 0 }
      });
    } catch (error) {
      console.warn("API unavailable — generating locally.", error);
      const graph = generateMockSceneGraph(LOCAL_PROJECT_ID, prompt);
      set({
        graph,
        projectId: undefined,
        selectedSceneId: graph.scenes[0]?.id ?? "scene_01",
        render: { status: "idle", progress: 0 }
      });
    }
  },
  selectScene: (selectedSceneId) => set({ selectedSceneId }),
  updateScene: (sceneId, patch) =>
    set((state) => ({
      graph: {
        ...state.graph,
        scenes: state.graph.scenes.map((scene) => (scene.id === sceneId ? { ...scene, ...patch } : scene))
      }
    })),
  updateNodeLabel: (sceneId, nodeId, label) =>
    set((state) => ({
      graph: {
        ...state.graph,
        scenes: state.graph.scenes.map((scene) =>
          scene.id === sceneId
            ? {
                ...scene,
                nodes: scene.nodes.map((node) => (node.id === nodeId ? { ...node, label } : node))
              }
            : scene
        )
      }
    })),
  moveScene: (sceneId, direction) =>
    set((state) => {
      const scenes = [...state.graph.scenes];
      const index = scenes.findIndex((scene) => scene.id === sceneId);
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= scenes.length) {
        return state;
      }

      const current = scenes[index];
      const next = scenes[nextIndex];
      if (!current || !next) {
        return state;
      }

      scenes[index] = next;
      scenes[nextIndex] = current;

      return {
        graph: {
          ...state.graph,
          scenes
        }
      };
    }),
  startRender: async (options = {}) => {
    const { projectId, graph } = get();

    if (!projectId) {
      simulateRender((render) => set({ render }));
      return;
    }

    try {
      set({ render: { status: "queued", progress: 0 } });
      await saveSceneGraph(projectId, graph);
      const { jobId } = await startRenderJob(projectId, options);

      const poll = async () => {
        const job = await getRenderJob(jobId);
        set({ render: { status: job.status, progress: job.progress, outputUrl: job.outputUrl } });
        if (job.status !== "completed" && job.status !== "failed") {
          window.setTimeout(() => void poll(), 1200);
        }
      };
      void poll();
    } catch (error) {
      console.warn("Render via API failed — simulating.", error);
      simulateRender((render) => set({ render }));
    }
  }
}));
