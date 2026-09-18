import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Worker, Queue } from "bullmq";
import { Redis } from "ioredis";
import pg from "pg";
import { RENDER_QUEUE_NAME, type RenderJobData, type RenderJobResult } from "@explainmotion/shared";
import { sceneGraphSchema } from "@explainmotion/schema";
import { renderExplainer } from "@explainmotion/renderer/render";
import { uploadRender } from "./storage.js";
import { sendRenderCompleteEmail } from "./email.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null });
connection.on("error", error => console.error("Redis unavailable:", error.message));
const queue = new Queue<RenderJobData>(RENDER_QUEUE_NAME, { connection });
const outputDir = process.env.RENDER_OUTPUT_DIR ?? path.resolve("render-output");
mkdirSync(outputDir, { recursive: true });

const worker = new Worker<RenderJobData, RenderJobResult>(RENDER_QUEUE_NAME, async job => {
  const id = job.data.renderJobId;
  const lease = randomUUID();
  const claimed = await pool.query(`UPDATE render_jobs SET status='rendering', lease_token=$2, heartbeat_at=now(), updated_at=now(), error_message=NULL
    WHERE id=$1 AND status NOT IN ('completed','failed') RETURNING *`, [id, lease]);
  if (!claimed.rows[0]) {
    const existing = await pool.query('SELECT output_key FROM render_jobs WHERE id=$1', [id]);
    return { outputKey: existing.rows[0]?.output_key ?? "" };
  }
  const record = claimed.rows[0];
  const key = `${id}-${lease}.${record.format}`;
  const outputPath = path.join(outputDir, key);
  let progress = 0;
  let heartbeatBusy = false;
  const heartbeat = setInterval(async () => {
    if (heartbeatBusy) return;
    heartbeatBusy = true;
    try { await pool.query(`UPDATE render_jobs SET progress=$3, heartbeat_at=now(), updated_at=now() WHERE id=$1 AND lease_token=$2 AND status IN ('rendering','uploading')`, [id, lease, progress]); }
    catch (error) { console.error("Heartbeat failed:", error); }
    finally { heartbeatBusy = false; }
  }, 2000);
  try {
    const graph = sceneGraphSchema.parse(record.scene_graph);
    if (graph.projectId !== record.project_id) throw new Error("Project identity mismatch");
    await renderExplainer({ graph, outputPath, format: record.format, orientation: record.orientation, watermark: record.watermark,
      onProgress: value => { progress = Math.min(95, Math.floor(value * 0.95)); } });
    await pool.query("UPDATE render_jobs SET status='uploading', progress=95, heartbeat_at=now() WHERE id=$1 AND lease_token=$2", [id, lease]);
    const outputKey = await uploadRender(outputPath, key);
    const completed = await pool.query(`UPDATE render_jobs SET status='completed', progress=100, output_key=$3, updated_at=now(), heartbeat_at=now()
      WHERE id=$1 AND lease_token=$2 RETURNING user_id, project_id`, [id, lease, outputKey]);
    if (completed.rows[0]) {
      const user = await pool.query('SELECT email FROM "user" WHERE id=$1', [record.user_id]);
      if (user.rows[0] && process.env.BETTER_AUTH_URL) {
        // Send only an authenticated project link, never a public private-media URL.
        const link = new URL('/', process.env.BETTER_AUTH_URL); link.searchParams.set('project', record.project_id);
        await sendRenderCompleteEmail(user.rows[0].email, link.toString()).catch(error => console.error("Notification failed:", error));
      }
    }
    return { outputKey };
  } catch (error) {
    const finalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
    await pool.query(`UPDATE render_jobs SET status=$3, error_message=$4, updated_at=now(), heartbeat_at=now() WHERE id=$1 AND lease_token=$2 AND status <> 'completed'`,
      [id, lease, finalAttempt ? "failed" : "queued", finalAttempt ? "Rendering failed. Your project is saved; try a new render." : null]);
    throw error;
  } finally {
    clearInterval(heartbeat);
    if ((process.env.STORAGE_PROVIDER ?? "local") !== "local") await unlink(outputPath).catch(() => {});
  }
}, { connection, concurrency: Math.max(1, Number(process.env.RENDER_CONCURRENCY ?? 1)) });

// Durable outbox recovery: recreate missing queue entries, including after Redis
// loss. Freshly running jobs retain their lease; stale leases are reclaimed only
// when no live BullMQ job exists. Re-adding a retained ID is idempotent.
let dispatching = false;
async function dispatchPending() {
  if (dispatching) return;
  dispatching = true;
  try {
    const { rows } = await pool.query(`SELECT id FROM render_jobs WHERE status='queued' OR
      (status IN ('rendering','uploading') AND heartbeat_at < now() - interval '2 minutes') ORDER BY created_at LIMIT 100`);
    for (const row of rows) {
      const queued = await queue.getJob(row.id);
      if (queued) {
        if (await queued.getState() === 'failed') {
          await pool.query("UPDATE render_jobs SET status='failed', error_message='Rendering stopped. Your project is saved; try a new render.', updated_at=now() WHERE id=$1 AND status <> 'completed'", [row.id]);
        }
        continue;
      }
      await queue.add('render', { renderJobId: row.id }, { jobId: row.id, attempts: 2, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: { age: 604800 }, removeOnFail: { age: 604800 } });
    }
  } catch (error) { console.error("Outbox dispatch will retry:", error); }
  finally { dispatching = false; }
}
const dispatcher = setInterval(() => void dispatchPending(), 15000);
void dispatchPending();
worker.on('error', error => console.error('Worker error:', error));
worker.on('failed', (job, error) => console.error(`Render ${job?.id} failed:`, error));
async function shutdown() { clearInterval(dispatcher); await worker.close(); await queue.close(); await connection.quit(); await pool.end(); }
process.once('SIGTERM', () => void shutdown());
process.once('SIGINT', () => void shutdown());
