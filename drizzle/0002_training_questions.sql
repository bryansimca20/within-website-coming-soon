ALTER TABLE "sample_feedback" ALTER COLUMN "felt" SET DATA TYPE text[] USING ARRAY["felt"];--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "main_sport" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "train_where" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "hydration_goal" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD COLUMN "training_types" text[];--> statement-breakpoint
ALTER TABLE "sample_requests" ADD COLUMN "training_other" text;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD COLUMN "training_primary" text;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD COLUMN "heard_from" text;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD COLUMN "heard_from_other" text;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD COLUMN "why_reasons" text[];--> statement-breakpoint
ALTER TABLE "sample_requests" ADD COLUMN "why_other" text;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD COLUMN "hopes" text[];--> statement-breakpoint
ALTER TABLE "sample_requests" ADD COLUMN "hopes_other" text;