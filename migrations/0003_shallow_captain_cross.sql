ALTER TABLE "objectives" ADD COLUMN "priority" text DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "objectives" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "objectives" ADD COLUMN "due_date" timestamp;