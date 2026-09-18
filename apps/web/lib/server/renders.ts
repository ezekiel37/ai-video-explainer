import { and, count, desc, eq, gte, ne, sql } from "drizzle-orm";
import { sceneGraphSchema } from "@explainmotion/schema";
import type { RenderJobSnapshot } from "@explainmotion/shared";
import { db } from "./db/client";
import { user } from "./db/auth-schema";
import { projects, renderEvents, renderJobs, type RenderJobRow } from "./db/schema";
import { getEntitlement } from "./entitlements";
import { HttpError } from "./http";

export type RenderRequest = { requestId: string; version: number; format: "mp4" | "gif"; orientation: "landscape" | "portrait" };
export async function reserveRender(userId: string, projectId: string, input: RenderRequest) {
  return db.transaction(async tx => {
    // Serializes reservations for this account: no count/check/insert race.
    const [owner] = await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for("update");
    if (!owner) throw new HttpError(401, "Please sign in again.");
    const [existing] = await tx.select().from(renderJobs).where(eq(renderJobs.id, input.requestId));
    if (existing) {
      if (existing.userId !== userId || existing.projectId !== projectId || existing.projectVersion !== input.version || existing.format !== input.format || existing.orientation !== input.orientation) {
        throw new HttpError(409, "This request ID has already been used for a different render.");
      }
      return existing;
    }
    const [project] = await tx.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.userId, userId))).for("update");
    if (!project) throw new HttpError(404, "Project not found.");
    if (project.version !== input.version) throw new HttpError(409, "Save or reload the latest project version before rendering.");
    if (!project.sceneGraph) throw new HttpError(400, "Create scenes before rendering.");
    const graph = sceneGraphSchema.parse(project.sceneGraph);
    if (graph.projectId !== projectId) throw new HttpError(400, "The scene graph belongs to a different project.");
    const start = new Date(); start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
    const [{ total }] = await tx.select({ total: count() }).from(renderJobs).where(and(eq(renderJobs.userId, userId), gte(renderJobs.createdAt, start), ne(renderJobs.status, "failed")));
    const [{ legacy }] = await tx.select({ legacy: count() }).from(renderEvents).where(and(eq(renderEvents.userId, userId), gte(renderEvents.createdAt, start)));
    const entitlement = getEntitlement(userId);
    if (entitlement.monthlyVideoLimit !== null && total + legacy >= entitlement.monthlyVideoLimit) throw new HttpError(402, "Your three renders for this month have been used. Your project is saved; rendering is available again next month.");
    const [{ active }] = await tx.select({ active: count() }).from(renderJobs).where(and(eq(renderJobs.userId, userId), sql`${renderJobs.status} in ('queued','rendering','uploading')`));
    if (active >= 1) throw new HttpError(429, "Wait for your current render to finish before starting another.");
    const [job] = await tx.insert(renderJobs).values({ id: input.requestId, userId, projectId, projectVersion: input.version, sceneGraph: graph, format: input.format, orientation: input.orientation, watermark: entitlement.watermark }).returning();
    return job;
  });
}
export function jobSnapshot(job: RenderJobRow): RenderJobSnapshot {
  return { id: job.id, projectId: job.projectId, projectVersion: job.projectVersion,
    status: job.status as RenderJobSnapshot["status"], progress: job.progress,
    outputUrl: job.status === "completed" && job.outputKey ? `/api/render-jobs/${job.id}/download` : undefined,
    errorMessage: job.errorMessage ?? undefined };
}
export async function latestRender(projectId: string, userId: string) {
  const [job] = await db.select().from(renderJobs).where(and(eq(renderJobs.projectId, projectId), eq(renderJobs.userId, userId))).orderBy(desc(renderJobs.createdAt)).limit(1);
  return job ? jobSnapshot(job) : null;
}
