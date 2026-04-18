ALTER TABLE "finance_entries" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD COLUMN "manual_amounts" jsonb;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD COLUMN "attachments" jsonb;