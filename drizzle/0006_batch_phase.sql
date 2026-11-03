-- A batch's public state becomes an explicit choice in admin: coming soon, open or closed.
CREATE TYPE "public"."sample_batch_phase" AS ENUM('upcoming', 'open', 'closed');--> statement-breakpoint
ALTER TABLE "sample_batches" ADD COLUMN "phase" "sample_batch_phase" DEFAULT 'upcoming' NOT NULL;--> statement-breakpoint
-- Keep what each database shows today: open stays open; closed after taking requests stays closed;
-- a batch that never took a request (a fresh production database) starts as coming soon.
UPDATE "sample_batches" SET "phase" = CASE
  WHEN "is_open" THEN 'open'::"sample_batch_phase"
  WHEN EXISTS (SELECT 1 FROM "sample_requests" WHERE "sample_requests"."batch_id" = "sample_batches"."id") THEN 'closed'::"sample_batch_phase"
  ELSE 'upcoming'::"sample_batch_phase"
END;--> statement-breakpoint
ALTER TABLE "sample_batches" DROP COLUMN "is_open";
