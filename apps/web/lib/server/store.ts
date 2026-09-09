import { eq } from "drizzle-orm";
import { generateMockSceneGraph } from "@explainmotion/ai";
import type { SceneGraph } from "@explainmotion/schema";
import { db } from "./db/client";
import { projects, type ProjectRow } from "./db/schema";

export type ProjectRecord = ProjectRow;

export async function createProject(input: {
  title: string;
  prompt: string;
  format: string;
  style: string;
  userId?: string | null;
}): Promise<ProjectRecord> {
  const [row] = await db
    .insert(projects)
    .values({
      title: input.title,
      prompt: input.prompt,
      format: input.format,
      style: input.style,
      status: "draft",
      userId: input.userId ?? null
    })
    .returning();
  return row;
}

export async function getProject(id: string): Promise<ProjectRecord | undefined> {
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return row;
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<ProjectRecord, "status" | "sceneGraph" | "title">>
): Promise<ProjectRecord | undefined> {
  const [row] = await db
    .update(projects)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return row;
}

const DEMO_PROJECT_ID = "4b83f3c8-95a6-4ed0-9e89-53edac5b28c4";
const DEMO_PROMPT =
  "Explain how a user sends money from User A to User B in a fintech app. Show checks, ledger updates, notifications, and success.";

/** Idempotently seed the demo project so the studio has something to open. */
export async function seedDemoProject(): Promise<void> {
  const sceneGraph: SceneGraph = generateMockSceneGraph(DEMO_PROJECT_ID, DEMO_PROMPT);
  await db
    .insert(projects)
    .values({
      id: DEMO_PROJECT_ID,
      title: "How Money Transfer Works",
      prompt: DEMO_PROMPT,
      status: "planned",
      format: "landscape",
      style: "minimal-tech",
      sceneGraph
    })
    .onConflictDoNothing({ target: projects.id });
}
