CREATE TYPE "public"."sample_payment_method" AS ENUM('midtrans', 'bank_transfer');--> statement-breakpoint
ALTER TYPE "public"."sample_request_status" ADD VALUE 'awaiting_confirmation' BEFORE 'paid';--> statement-breakpoint
ALTER TABLE "sample_batches" ADD COLUMN "payment_method" "sample_payment_method" DEFAULT 'midtrans' NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD COLUMN "payment_code" text;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD COLUMN "transfer_reported_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD CONSTRAINT "sample_requests_payment_code_unique" UNIQUE("payment_code");