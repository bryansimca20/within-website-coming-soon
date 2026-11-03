ALTER TABLE "sample_feedback" ALTER COLUMN "session_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_feedback" ALTER COLUMN "session_length" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_feedback" ALTER COLUMN "taste_rating" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_feedback" ALTER COLUMN "felt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_feedback" ALTER COLUMN "would_reach_again" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_feedback" ADD COLUMN "rating" integer;--> statement-breakpoint
ALTER TABLE "sample_feedback" ADD COLUMN "review" text;--> statement-breakpoint
ALTER TABLE "sample_feedback" ADD COLUMN "headline" text;--> statement-breakpoint
ALTER TABLE "sample_feedback" ADD COLUMN "effectiveness" integer;