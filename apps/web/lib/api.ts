import type { SceneGraph } from "@explainmotion/schema";
import type { RenderJobSnapshot } from "@explainmotion/shared";
export type Project = { id: string; title: string; prompt: string; sourceType: "prompt" | "import"; version: number; sceneGraph: SceneGraph | null; latestRender?: RenderJobSnapshot | null };
export type ProjectSummary = Pick<Project, "id" | "title" | "version">;
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { "content-type": "application/json", ...init?.headers }, signal: init?.signal ?? AbortSignal.timeout(15000) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, body.message ?? `Request failed (${response.status}).`);
  return body as T;
}
export const listProjects = () => request<ProjectSummary[]>("/api/projects");
export const getProject = (id: string) => request<Project>(`/api/projects/${id}`);
export const createProject = (input: { title: string; prompt: string; sourceType: string }) => request<Project>("/api/projects", { method: "POST", body: JSON.stringify(input) });
export const saveSceneGraph = (id: string, input: { version: number; sceneGraph: SceneGraph; prompt: string; sourceType: string }) => request<Project>(`/api/projects/${id}/scene-graph`, { method: "PATCH", body: JSON.stringify(input) });
export type RenderOptions = { format: "mp4" | "gif"; orientation: "landscape" | "portrait" };
export const startRenderJob = (id: string, input: RenderOptions & { requestId: string; version: number }) => request<RenderJobSnapshot>(`/api/projects/${id}/render`, { method: "POST", body: JSON.stringify(input) });
export const getRenderJob = (id: string) => request<RenderJobSnapshot>(`/api/render-jobs/${id}`);
