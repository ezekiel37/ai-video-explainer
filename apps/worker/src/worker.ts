import { mkdirSync } from "node:fs";
import path from "node:path";
import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { RENDER_QUEUE_NAME, type RenderJobData, type RenderJobResult } from "@explainmotion/shared";
import { renderExplainer } from "@explainmotion/renderer/render";
import { uploadRender } from "./storage.js";
import { sendRenderCompleteEmail } from "./email.js";

const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null
});

const outputDir = process.env.RENDER_OUTPUT_DIR ?? path.join(process.cwd(), "render-output");
mkdirSync(outputDir, { recursive: true });

const worker = new Worker<RenderJobData, RenderJobResult>(
  RENDER_QUEUE_NAME,
  async (job) => {
    const { projectId, sceneGraph, format = "mp4", orientation = "landscape", watermark = false, notifyEmail } = job.data;
    await job.log(`Rendering ${sceneGraph.scenes.length} scenes (${format}, ${orientation}) for project ${projectId}`);

    const extension = format === "gif" ? "gif" : "mp4";
    const key = `${job.id}.${extension}`;
    const outputPath = path.join(outputDir, key);
    await renderExplainer({
      graph: sceneGraph,
      outputPath,
      format,
      orientation,
      watermark,
      onProgress: (percent) => {
        void job.updateProgress(percent);
      }
    });

    // Upload to object storage (R2/S3); falls back to a local path if unconfigured.
    const outputUrl = await uploadRender(outputPath, key);
    await job.log(`Output ready: ${outputUrl}`);

    if (notifyEmail) {
      try {
        await sendRenderCompleteEmail(notifyEmail, outputUrl);
      } catch (error) {
        console.error("Render-complete email failed:", error);
      }
    }

    return { outputUrl };
  },
  {
    connection,
    // Remotion renders are CPU-heavy; keep concurrency low per worker.
    concurrency: Number(process.env.RENDER_CONCURRENCY ?? 1)
  }
);

worker.on("completed", (job) => {
  console.log(`Render job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Render job ${job?.id ?? "unknown"} failed`, error);
});
