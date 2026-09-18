CREATE TABLE "render_jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"project_version" integer NOT NULL,
	"scene_graph" jsonb NOT NULL,
	"format" text NOT NULL,
	"orientation" text NOT NULL,
	"watermark" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"output_key" text,
	"error_message" text,
	"lease_token" uuid,
	"heartbeat_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "render_jobs_format_check" CHECK ("render_jobs"."format" in ('mp4','gif')),
	CONSTRAINT "render_jobs_orientation_check" CHECK ("render_jobs"."orientation" in ('landscape','portrait')),
	CONSTRAINT "render_jobs_status_check" CHECK ("render_jobs"."status" in ('queued','rendering','uploading','completed','failed')),
	CONSTRAINT "render_jobs_progress_check" CHECK ("render_jobs"."progress" between 0 and 100)
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "source_type" text DEFAULT 'prompt' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "render_jobs" ADD CONSTRAINT "render_jobs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "render_jobs" ADD CONSTRAINT "render_jobs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "render_jobs_owner_month_idx" ON "render_jobs" USING btree ("user_id","created_at");--> statement-breakpoint
-- Preserve legacy anonymous/unresolvable content without exposing it.
UPDATE "projects" SET "user_id"=NULL WHERE "user_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "user" WHERE "user"."id"="projects"."user_id");
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
