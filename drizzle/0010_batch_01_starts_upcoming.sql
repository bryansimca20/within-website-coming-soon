-- Migrating must never open the form. Batch 01 was seeded open, so an open Batch 01 with no requests goes back to
-- coming soon, and a founder opens it in admin. One that already took requests keeps its phase.
UPDATE "sample_batches" SET "phase" = 'upcoming'
WHERE "id" = 'b01' AND "phase" = 'open'
  AND NOT EXISTS (SELECT 1 FROM "sample_requests" WHERE "sample_requests"."batch_id" = "sample_batches"."id");
