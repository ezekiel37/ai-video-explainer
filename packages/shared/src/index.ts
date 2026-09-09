import type { SceneGraph } from "@explainmotion/schema";

export const RENDER_QUEUE_NAME = "render-video";

export const renderJobStatuses = [
  "queued",
  "planning",
  "generating_voiceover",
  "rendering",
  "uploading",
  "completed",
  "failed"
] as const;

export type RenderJobStatus = (typeof renderJobStatuses)[number];

export type RenderJobSnapshot = {
  id: string;
  projectId: string;
  status: RenderJobStatus;
  progress: number;
  outputUrl?: string;
  errorMessage?: string;
};

export type RenderFormat = "mp4" | "gif";
export type RenderOrientation = "landscape" | "portrait";

/** Payload the API enqueues and the worker renders. */
export type RenderJobData = {
  projectId: string;
  sceneGraph: SceneGraph;
  format?: RenderFormat;
  orientation?: RenderOrientation;
  watermark?: boolean;
  /** When set (and Brevo is configured), the worker emails this address on completion. */
  notifyEmail?: string;
};

/** What the worker returns when a render finishes. */
export type RenderJobResult = {
  outputUrl: string;
};

/** Map a BullMQ job state to our render status vocabulary. */
export function mapJobStateToStatus(state: string): RenderJobStatus {
  switch (state) {
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    case "active":
      return "rendering";
    default:
      return "queued";
  }
}

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}
