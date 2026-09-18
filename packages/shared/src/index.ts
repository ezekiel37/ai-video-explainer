
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
  projectVersion?: number;
  status: RenderJobStatus;
  progress: number;
  outputUrl?: string;
  errorMessage?: string;
};

export type RenderFormat = "mp4" | "gif";
export type RenderOrientation = "landscape" | "portrait";

/** Queue payload references an immutable, owner-scoped database job. */
export type RenderJobData = { renderJobId: string };
export type RenderJobResult = { outputKey: string };

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
