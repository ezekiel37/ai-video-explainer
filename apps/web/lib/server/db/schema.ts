import { integer, jsonb, pgTable, text, timestamp, uuid, boolean, index, check } from "drizzle-orm/pg-core";
import type { SceneGraph } from "@explainmotion/schema";
import { sql } from "drizzle-orm";
import { user } from "./auth-schema";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Legacy anonymous demos remain unowned and inaccessible through private routes.
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  sourceType: text("source_type").notNull().default("prompt"),
  version: integer("version").notNull().default(1),
  status: text("status").notNull().default("draft"),
  format: text("format").notNull().default("landscape"),
  style: text("style").notNull().default("minimal-tech"),
  sceneGraph: jsonb("scene_graph").$type<SceneGraph>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
export type ProjectRow = typeof projects.$inferSelect;

// Historical usage is retained so upgrading does not reset existing allowances.
export const renderEvents = pgTable("render_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  projectId: uuid("project_id").notNull(),
  format: text("format").notNull().default("mp4"),
  orientation: text("orientation").notNull().default("landscape"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const renderJobs = pgTable("render_jobs", {
  id: uuid("id").primaryKey(), // client request UUID is also the idempotency key
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  projectVersion: integer("project_version").notNull(),
  sceneGraph: jsonb("scene_graph").$type<SceneGraph>().notNull(),
  format: text("format").notNull(),
  orientation: text("orientation").notNull(),
  watermark: boolean("watermark").notNull().default(true),
  status: text("status").notNull().default("queued"),
  progress: integer("progress").notNull().default(0),
  outputKey: text("output_key"),
  errorMessage: text("error_message"),
  leaseToken: uuid("lease_token"),
  heartbeatAt: timestamp("heartbeat_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, table => [index("render_jobs_owner_month_idx").on(table.userId, table.createdAt),
  check("render_jobs_format_check", sql`${table.format} in ('mp4','gif')`),
  check("render_jobs_orientation_check", sql`${table.orientation} in ('landscape','portrait')`),
  check("render_jobs_status_check", sql`${table.status} in ('queued','rendering','uploading','completed','failed')`),
  check("render_jobs_progress_check", sql`${table.progress} between 0 and 100`)]);
export type RenderJobRow = typeof renderJobs.$inferSelect;
