CREATE TYPE "public"."sample_payment_status" AS ENUM('pending', 'settlement', 'expire', 'cancel', 'deny', 'failure');--> statement-breakpoint
CREATE TYPE "public"."sample_request_status" AS ENUM('pending_payment', 'paid', 'shipped', 'delivered', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."webhook_provider" AS ENUM('midtrans', 'biteship');--> statement-breakpoint
CREATE TABLE "sample_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"capacity" integer NOT NULL,
	"is_open" boolean DEFAULT true NOT NULL,
	"payment_window_minutes" integer DEFAULT 1440 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sample_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid,
	"email" text NOT NULL,
	"session_type" text NOT NULL,
	"session_length" text NOT NULL,
	"taste_rating" integer NOT NULL,
	"felt" text NOT NULL,
	"felt_other" text,
	"would_reach_again" text NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sample_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"midtrans_order_id" text NOT NULL,
	"gross_amount" integer NOT NULL,
	"snap_token" text NOT NULL,
	"snap_redirect_url" text NOT NULL,
	"status" "sample_payment_status" DEFAULT 'pending' NOT NULL,
	"payment_type" text,
	"transaction_id" text,
	"transaction_time" text,
	"settled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sample_payments_midtrans_order_id_unique" UNIQUE("midtrans_order_id")
);
--> statement-breakpoint
CREATE TABLE "sample_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" text NOT NULL,
	"box_number" integer NOT NULL,
	"access_token" text NOT NULL,
	"status" "sample_request_status" DEFAULT 'pending_payment' NOT NULL,
	"main_sport" text NOT NULL,
	"main_sport_other" text,
	"sessions_per_week" text NOT NULL,
	"session_length" text NOT NULL,
	"train_where" text NOT NULL,
	"hydration_goal" text NOT NULL,
	"hydration_goal_other" text,
	"run_club" text,
	"full_name" text NOT NULL,
	"first_name" text NOT NULL,
	"email" text NOT NULL,
	"whatsapp" text NOT NULL,
	"instagram_handle" text NOT NULL,
	"address_line" text NOT NULL,
	"delivery_note" text,
	"area_id" text NOT NULL,
	"area_name" text NOT NULL,
	"province" text NOT NULL,
	"city" text NOT NULL,
	"district" text NOT NULL,
	"postal_code" text NOT NULL,
	"will_share" boolean DEFAULT false NOT NULL,
	"consented_at" timestamp with time zone NOT NULL,
	"ref" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"landing_path" text,
	"courier_company" text NOT NULL,
	"courier_type" text NOT NULL,
	"courier_service_name" text NOT NULL,
	"shipping_fee" integer NOT NULL,
	"shipping_eta" text NOT NULL,
	"shopify_outcome" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"admin_note" text,
	CONSTRAINT "sample_requests_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "sample_shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"attempt" integer NOT NULL,
	"reference_id" text NOT NULL,
	"biteship_order_id" text NOT NULL,
	"tracking_id" text,
	"waybill_id" text,
	"courier_company" text NOT NULL,
	"courier_type" text NOT NULL,
	"tracking_link" text,
	"status" text NOT NULL,
	"price" integer,
	"delivery_type" text NOT NULL,
	"scheduled_for" timestamp with time zone,
	"history" jsonb,
	"shipped_email_sent_at" timestamp with time zone,
	"delivered_email_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sample_shipments_reference_id_unique" UNIQUE("reference_id"),
	CONSTRAINT "sample_shipments_biteship_order_id_unique" UNIQUE("biteship_order_id")
);
--> statement-breakpoint
CREATE TABLE "sample_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "webhook_provider" NOT NULL,
	"external_ref" text,
	"payload" jsonb NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"error" text
);
--> statement-breakpoint
ALTER TABLE "sample_feedback" ADD CONSTRAINT "sample_feedback_request_id_sample_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."sample_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_payments" ADD CONSTRAINT "sample_payments_request_id_sample_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."sample_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD CONSTRAINT "sample_requests_batch_id_sample_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."sample_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_shipments" ADD CONSTRAINT "sample_shipments_request_id_sample_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."sample_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sample_feedback_request" ON "sample_feedback" USING btree ("request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sample_requests_batch_box" ON "sample_requests" USING btree ("batch_id","box_number");--> statement-breakpoint
CREATE INDEX "sample_requests_email" ON "sample_requests" USING btree ("email");--> statement-breakpoint
CREATE INDEX "sample_requests_status" ON "sample_requests" USING btree ("status");