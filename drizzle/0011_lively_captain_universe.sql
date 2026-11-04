CREATE TYPE "public"."sample_request_source" AS ENUM('shipped', 'in_person');--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "batch_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "box_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "address_line" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "area_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "area_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "province" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "district" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "postal_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "courier_company" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "courier_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "courier_service_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "shipping_fee" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ALTER COLUMN "shipping_eta" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD COLUMN "source" "sample_request_source" DEFAULT 'shipped' NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD COLUMN "is_test" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD CONSTRAINT "sample_requests_shipped_has_delivery" CHECK ("sample_requests"."source" <> 'shipped' or ("sample_requests"."batch_id" is not null and "sample_requests"."box_number" is not null and "sample_requests"."address_line" is not null and "sample_requests"."area_id" is not null and "sample_requests"."postal_code" is not null and "sample_requests"."courier_company" is not null and "sample_requests"."shipping_fee" is not null));