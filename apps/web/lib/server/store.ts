import { and, desc, eq, sql } from "drizzle-orm";
import type { SceneGraph } from "@explainmotion/schema";
import { db } from "./db/client";
import { projects, type ProjectRow } from "./db/schema";
import { HttpError } from "./http";

export async function createProject(input: { title: string; prompt: string; sourceType: string; userId: string }) {
  const [row] = await db.insert(projects).values(input).returning();
  return row;
}
export async function listProjects(userId: string) {
  return db.select({ id: projects.id, title: projects.title, version: projects.version, updatedAt: projects.updatedAt })
    .from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt)).limit(100);
}
export async function updateProject(id: string, userId: string, version: number,
  patch: Partial<Pick<ProjectRow, "sceneGraph" | "title" | "prompt" | "sourceType">> & { sceneGraph?: SceneGraph }) {
  const [row] = await db.update(projects).set({ ...patch, version: sql`${projects.version} + 1`, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.userId, userId), eq(projects.version, version))).returning();
  if (!row) throw new HttpError(409, "This project changed in another tab. Copy your edits before reloading the saved version.");
  return row;
}
