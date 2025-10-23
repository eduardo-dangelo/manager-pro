ALTER TABLE "tasks" RENAME TO "todos";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "tabs" text[] DEFAULT ARRAY['overview']::text[] NOT NULL;

