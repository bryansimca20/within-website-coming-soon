CREATE TYPE "public"."review_share_consent" AS ENUM('yes', 'no', 'notice');--> statement-breakpoint
ALTER TABLE "sample_feedback" ADD COLUMN "share_consent" "review_share_consent";--> statement-breakpoint
-- Reviews with stars were all written under the share note, which shipped with them (PR #3).
UPDATE "sample_feedback" SET "share_consent" = 'notice' WHERE "rating" IS NOT NULL;