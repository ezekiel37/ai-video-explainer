import type { SceneGraph } from "@explainmotion/schema";
import type { RenderJobSnapshot } from "@explainmotion/shared";

// Same-origin Next.js route handlers by default; override only to point at a
// standalone API host.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "content-type": "application/json" },
    ...init
  });
  if (!response.ok) {
    throw new Error(`API ${path} failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export async function createProject(input: { title: string; prompt: string }) {
  return request<{ projectId: string; status: string }>("/api/projects", {
    method: "POST",
    body: JSON.stringify({ ...input, format: "landscape", style: "minimal-tech" })
  });
}

export async function planProject(projectId: string) {
  return request<{ projectId: string; sceneGraph: SceneGraph }>(`/api/projects/${projectId}/plan`, {
    method: "POST"
  });
}

export async function saveSceneGraph(projectId: string, sceneGraph: SceneGraph) {
  return request<{ projectId: string; sceneGraph: SceneGraph }>(`/api/projects/${projectId}/scene-graph`, {
    method: "PATCH",
    body: JSON.stringify(sceneGraph)
  });
}

export async function importMermaid(projectId: string, diagram: string) {
  return request<{ projectId: string; sceneGraph: SceneGraph }>(`/api/projects/${projectId}/import-mermaid`, {
    method: "POST",
    body: JSON.stringify({ diagram })
  });
}

export type RenderFormat = "mp4" | "gif";
export type RenderOrientation = "landscape" | "portrait";

export async function startRenderJob(
  projectId: string,
  options: { format?: RenderFormat; orientation?: RenderOrientation } = {}
) {
  return request<{ jobId: string; status: string }>(`/api/projects/${projectId}/render`, {
    method: "POST",
    body: JSON.stringify(options)
  });
}

export async function getRenderJob(jobId: string) {
  return request<RenderJobSnapshot>(`/api/render-jobs/${jobId}`);
}
