import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { SceneGraph } from "@explainmotion/schema";

// Better Auth owns the user/session/account/verification tables (see auth-schema.ts).

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Better Auth user ids are text; nullable so anonymous demo flows still work.
  userId: text("user_id"),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  status: text("status").notNull().default("draft"),
  format: text("format").notNull().default("landscape"),
  style: text("style").notNull().default("minimal-tech"),
  sceneGraph: jsonb("scene_graph").$type<SceneGraph>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export type ProjectRow = typeof projects.$inferSelect;

/** One row per render request — used to enforce the free-tier monthly cap. */
export const renderEvents = pgTable("render_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  projectId: uuid("project_id").notNull(),
  format: text("format").notNull().default("mp4"),
  orientation: text("orientation").notNull().default("landscape"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
