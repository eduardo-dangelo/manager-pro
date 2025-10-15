ALTER TABLE "objectives" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sprints" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sprints" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "sprints" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "sprints" ADD COLUMN "status" text DEFAULT 'planned' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;