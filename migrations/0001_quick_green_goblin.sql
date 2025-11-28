ALTER TABLE "assets" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "color" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "color" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "subtype" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "registration_number" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "buy_or_rent" text;