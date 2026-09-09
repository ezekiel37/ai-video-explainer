CREATE TABLE "render_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"project_id" uuid NOT NULL,
	"format" text DEFAULT 'mp4' NOT NULL,
	"orientation" text DEFAULT 'landscape' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
