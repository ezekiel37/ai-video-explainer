import { Queue } from "bullmq";
import { Redis } from "ioredis";
import {
  RENDER_QUEUE_NAME,
  mapJobStateToStatus,
  type RenderJobData,
  type RenderJobResult,
  type RenderJobSnapshot
} from "@explainmotion/shared";

// Reuse a single Redis connection + Queue across hot reloads / route invocations.
const globalForQueue = globalThis as unknown as {
  __emRedis?: Redis;
  __emQueue?: Queue<RenderJobData, RenderJobResult>;
};

const connection =
  globalForQueue.__emRedis ?? new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null });
if (!globalForQueue.__emRedis) globalForQueue.__emRedis = connection;

export const renderQueue =
  globalForQueue.__emQueue ?? new Queue<RenderJobData, RenderJobResult>(RENDER_QUEUE_NAME, { connection });
if (!globalForQueue.__emQueue) globalForQueue.__emQueue = renderQueue;

export async function enqueueRender(data: RenderJobData): Promise<string> {
  const job = await renderQueue.add("render", data, {
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 3600 }
  });
  return String(job.id);
}

/** Read live job status from BullMQ (Redis) — the API routes and worker share state here. */
export async function getRenderJobSnapshot(jobId: string): Promise<RenderJobSnapshot | null> {
  const job = await renderQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  const progress = typeof job.progress === "number" ? job.progress : 0;

  return {
    id: jobId,
    projectId: job.data.projectId,
    status: mapJobStateToStatus(state),
    progress: state === "completed" ? 100 : progress,
    outputUrl: job.returnvalue?.outputUrl,
    errorMessage: job.failedReason
  };
}
