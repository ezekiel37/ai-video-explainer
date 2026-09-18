import { and, eq } from "drizzle-orm";
import { getAuth } from "./auth";
import { db } from "./db/client";
import { projects, renderJobs } from "./db/schema";
import { HttpError } from "./http";

export async function requireUser(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session?.user) throw new HttpError(401, "Sign in to save projects or render videos.");
  return session.user;
}

export async function requireProject(id: string, userId: string) {
  const [project] = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, userId))).limit(1);
  if (!project) throw new HttpError(404, "Project not found.");
  return project;
}

export async function requireRenderJob(id: string, userId: string) {
  const [job] = await db.select().from(renderJobs).where(and(eq(renderJobs.id, id), eq(renderJobs.userId, userId))).limit(1);
  if (!job) throw new HttpError(404, "Render job not found.");
  return job;
}
