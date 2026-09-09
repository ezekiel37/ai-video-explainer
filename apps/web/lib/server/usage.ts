import { and, count, eq, gte } from "drizzle-orm";
import { db } from "./db/client";
import { renderEvents } from "./db/schema";

export async function recordRender(input: {
  userId: string | null;
  projectId: string;
  format: string;
  orientation: string;
}): Promise<void> {
  await db.insert(renderEvents).values({
    userId: input.userId,
    projectId: input.projectId,
    format: input.format,
    orientation: input.orientation
  });
}

/** Renders this calendar month for a user (used to enforce the free-tier cap). */
export async function rendersThisMonth(userId: string): Promise<number> {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const [row] = await db
    .select({ value: count() })
    .from(renderEvents)
    .where(and(eq(renderEvents.userId, userId), gte(renderEvents.createdAt, start)));

  return row?.value ?? 0;
}
