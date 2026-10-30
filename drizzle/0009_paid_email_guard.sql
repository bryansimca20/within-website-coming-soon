ALTER TABLE "sample_requests" ADD COLUMN "paid_email_sent_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "sample_webhook_events_external_ref" ON "sample_webhook_events" USING btree ("external_ref");--> statement-breakpoint
-- Boxes paid before this column existed already had their email; the cron must not send it again.
UPDATE "sample_requests" SET "paid_email_sent_at" = "paid_at" WHERE "paid_at" IS NOT NULL;
