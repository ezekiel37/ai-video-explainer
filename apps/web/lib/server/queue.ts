import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { RENDER_QUEUE_NAME } from "@explainmotion/shared";

let queue: Queue<{ renderJobId: string }> | undefined;
export function getRenderQueue() {
  if (!queue) {
    const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 1, enableOfflineQueue: false, connectTimeout: 2000
    });
    connection.on("error", () => { /* Durable outbox is retried by the worker. */ });
    queue = new Queue(RENDER_QUEUE_NAME, { connection });
  }
  return queue;
}
export async function enqueueRender(id: string) {
  await getRenderQueue().add("render", { renderJobId: id }, {
    jobId: id, attempts: 2, backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 604800 }, removeOnFail: { age: 604800 }
  });
}
