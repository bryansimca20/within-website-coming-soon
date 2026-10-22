import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Lifecycle of one sample request, from hold to delivered box. */
export const sampleRequestStatusEnum = pgEnum("sample_request_status", [
  "pending_payment",
  "paid",
  "shipped",
  "delivered",
  "expired",
  "cancelled",
]);

/** Midtrans transaction statuses we keep, plus `failure` for anything unexpected. */
export const samplePaymentStatusEnum = pgEnum("sample_payment_status", [
  "pending",
  "settlement",
  "expire",
  "cancel",
  "deny",
  "failure",
]);

/** Who sent a stored webhook body. */
export const webhookProviderEnum = pgEnum("webhook_provider", ["midtrans", "biteship"]);

const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

/** One limited sample batch: its size, whether it takes requests, and how long a hold lasts. */
export const sampleBatches = pgTable("sample_batches", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  capacity: integer("capacity").notNull(),
  isOpen: boolean("is_open").notNull().default(true),
  paymentWindowMinutes: integer("payment_window_minutes").notNull().default(1440),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
});

/** One person's request for a box: profile, delivery details, attribution and lifecycle. */
export const sampleRequests = pgTable(
  "sample_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    batchId: text("batch_id")
      .notNull()
      .references(() => sampleBatches.id),
    boxNumber: integer("box_number").notNull(),
    accessToken: text("access_token").notNull().unique(),
    status: sampleRequestStatusEnum("status").notNull().default("pending_payment"),
    // Training profile. Closed sets are stored as option keys from sample-options.ts.
    trainingTypes: text("training_types").array(),
    trainingOther: text("training_other"),
    trainingPrimary: text("training_primary"),
    runClub: text("run_club"),
    sessionsPerWeek: text("sessions_per_week").notNull(),
    sessionLength: text("session_length").notNull(),
    heardFrom: text("heard_from"),
    heardFromOther: text("heard_from_other"),
    whyReasons: text("why_reasons").array(),
    whyOther: text("why_other"),
    hopes: text("hopes").array(),
    hopesOther: text("hopes_other"),
    // The form before 2026-10-22 asked these instead. Kept for its rows; no longer written.
    mainSport: text("main_sport"),
    mainSportOther: text("main_sport_other"),
    trainWhere: text("train_where"),
    hydrationGoal: text("hydration_goal"),
    hydrationGoalOther: text("hydration_goal_other"),
    // Contact.
    fullName: text("full_name").notNull(),
    firstName: text("first_name").notNull(),
    email: text("email").notNull(),
    whatsapp: text("whatsapp").notNull(),
    instagramHandle: text("instagram_handle").notNull(),
    // Delivery address, resolved through the Biteship area search.
    addressLine: text("address_line").notNull(),
    deliveryNote: text("delivery_note"),
    areaId: text("area_id").notNull(),
    areaName: text("area_name").notNull(),
    province: text("province").notNull(),
    city: text("city").notNull(),
    district: text("district").notNull(),
    postalCode: text("postal_code").notNull(),
    // The two checkboxes.
    willShare: boolean("will_share").notNull().default(false),
    consentedAt: timestamptz("consented_at").notNull(),
    // Where the request came from.
    ref: text("ref"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmContent: text("utm_content"),
    utmTerm: text("utm_term"),
    landingPath: text("landing_path"),
    // The courier the sampler chose and the fee they agreed to pay.
    courierCompany: text("courier_company").notNull(),
    courierType: text("courier_type").notNull(),
    courierServiceName: text("courier_service_name").notNull(),
    shippingFee: integer("shipping_fee").notNull(),
    shippingEta: text("shipping_eta").notNull(),
    shopifyOutcome: text("shopify_outcome"),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    expiresAt: timestamptz("expires_at").notNull(),
    paidAt: timestamptz("paid_at"),
    shippedAt: timestamptz("shipped_at"),
    deliveredAt: timestamptz("delivered_at"),
    adminNote: text("admin_note"),
  },
  (table) => [
    uniqueIndex("sample_requests_batch_box").on(table.batchId, table.boxNumber),
    index("sample_requests_email").on(table.email),
    index("sample_requests_status").on(table.status),
  ]
);

/** One Midtrans Snap transaction for a request. A request can have several attempts. */
export const samplePayments = pgTable("sample_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => sampleRequests.id),
  midtransOrderId: text("midtrans_order_id").notNull().unique(),
  grossAmount: integer("gross_amount").notNull(),
  snapToken: text("snap_token").notNull(),
  snapRedirectUrl: text("snap_redirect_url").notNull(),
  status: samplePaymentStatusEnum("status").notNull().default("pending"),
  paymentType: text("payment_type"),
  transactionId: text("transaction_id"),
  transactionTime: text("transaction_time"),
  settledAt: timestamptz("settled_at"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
});

/** One Biteship order for a request. Re-shipping adds another attempt; the latest is live. */
export const sampleShipments = pgTable("sample_shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => sampleRequests.id),
  attempt: integer("attempt").notNull(),
  referenceId: text("reference_id").notNull().unique(),
  biteshipOrderId: text("biteship_order_id").notNull().unique(),
  trackingId: text("tracking_id"),
  waybillId: text("waybill_id"),
  courierCompany: text("courier_company").notNull(),
  courierType: text("courier_type").notNull(),
  trackingLink: text("tracking_link"),
  status: text("status").notNull(),
  price: integer("price"),
  deliveryType: text("delivery_type").notNull(),
  scheduledFor: timestamptz("scheduled_for"),
  history: jsonb("history"),
  shippedEmailSentAt: timestamptz("shipped_email_sent_at"),
  deliveredEmailSentAt: timestamptz("delivered_email_sent_at"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
});

/** The check-in answers. `requestId` is null when the typed email matched nobody. */
export const sampleFeedback = pgTable(
  "sample_feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id").references(() => sampleRequests.id),
    email: text("email").notNull(),
    sessionType: text("session_type").notNull(),
    sessionLength: text("session_length").notNull(),
    tasteRating: integer("taste_rating").notNull(),
    felt: text("felt").array().notNull(),
    feltOther: text("felt_other"),
    wouldReachAgain: text("would_reach_again").notNull(),
    comment: text("comment"),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("sample_feedback_request").on(table.requestId)]
);

/** Every webhook body as received, before any processing, so nothing is lost and replays are visible. */
export const sampleWebhookEvents = pgTable("sample_webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: webhookProviderEnum("provider").notNull(),
  externalRef: text("external_ref"),
  payload: jsonb("payload").notNull(),
  receivedAt: timestamptz("received_at").notNull().defaultNow(),
  processedAt: timestamptz("processed_at"),
  error: text("error"),
});

export type SampleBatch = typeof sampleBatches.$inferSelect;
export type SampleRequest = typeof sampleRequests.$inferSelect;
export type NewSampleRequest = typeof sampleRequests.$inferInsert;
export type SamplePayment = typeof samplePayments.$inferSelect;
export type SampleShipment = typeof sampleShipments.$inferSelect;
export type SampleFeedbackRow = typeof sampleFeedback.$inferSelect;
export type SampleWebhookEvent = typeof sampleWebhookEvents.$inferSelect;
export type SampleRequestStatus = (typeof sampleRequestStatusEnum.enumValues)[number];
export type SamplePaymentStatus = (typeof samplePaymentStatusEnum.enumValues)[number];
