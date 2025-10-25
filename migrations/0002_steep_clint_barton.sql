ALTER TABLE "users" ADD COLUMN "projects_view_mode" text DEFAULT 'folder' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "projects_card_size" text DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "projects_sort_by" text DEFAULT 'dateModified' NOT NULL;