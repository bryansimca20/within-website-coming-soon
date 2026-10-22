import { resolveSource } from "@/app/utils/attribution";
import { groupIntent } from "@/app/utils/intent";
import type { WouldReachAgain } from "@/app/utils/sample-options";
import type { SampleFeedbackRow, SampleRequest, SampleShipment } from "@/db/schema";

import { SampleRequestService } from "./sample-request.service";

/** One request with its live shipment and its feedback, if any. */
export interface IExportRow {
  request: SampleRequest;
  shipment: SampleShipment | null;
  feedback: SampleFeedbackRow | null;
}

/** Column order of the CSV. Snake case so it reads cleanly in a spreadsheet. */
export const SAMPLE_CSV_COLUMNS = [
  "box",
  "status",
  "name",
  "email",
  "whatsapp",
  "instagram",
  "city",
  "district",
  "postal_code",
  "address",
  "delivery_note",
  "courier",
  "shipping_fee",
  "source",
  "ref",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "main_sport",
  "main_sport_other",
  "sessions_per_week",
  "session_length",
  "train_where",
  "hydration_goal",
  "hydration_goal_other",
  "run_club",
  "training_types",
  "training_other",
  "training_primary",
  "heard_from",
  "heard_from_other",
  "why_reasons",
  "why_other",
  "hopes",
  "hopes_other",
  "will_share",
  "created_at",
  "paid_at",
  "shipped_at",
  "delivered_at",
  "waybill",
  "shipment_status",
  "feedback_session",
  "feedback_length",
  "taste",
  "felt",
  "felt_other",
  "would_reach_again",
  "intent",
  "comment",
  "feedback_at",
] as const;

const BOM = "\uFEFF";
const FORMULA_START = /^[=+\-@\t\r]/;
const LINE = "\r\n";

function cell(value: string | number | boolean | Date | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  const raw = value instanceof Date ? value.toISOString() : String(value);
  // Sampler-typed text starting with = + - @ would run as a formula in Excel or Sheets.
  const text = typeof value === "string" && FORMULA_START.test(raw) ? `'${raw}` : raw;

  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** A multi-select answer as one cell: option keys joined with "; ", empty when absent. */
function joined(keys: string[] | null | undefined): string {
  return keys === null || keys === undefined ? "" : keys.join("; ");
}

/** Derives the intent group label, or empty when there is no feedback. */
function intentOf(feedback: SampleFeedbackRow | null): string {
  return feedback === null ? "" : groupIntent(feedback.wouldReachAgain as WouldReachAgain);
}

function rowValues({ request, shipment, feedback }: IExportRow): string[] {
  return [
    SampleRequestService.boxLabel(request.batchId, request.boxNumber),
    request.status,
    request.fullName,
    request.email,
    request.whatsapp,
    request.instagramHandle,
    request.city,
    request.district,
    request.postalCode,
    request.addressLine,
    request.deliveryNote,
    request.courierServiceName,
    request.shippingFee,
    resolveSource({
      ref: request.ref,
      utmSource: request.utmSource,
      utmMedium: request.utmMedium,
      utmCampaign: request.utmCampaign,
      utmContent: request.utmContent,
      utmTerm: request.utmTerm,
    }),
    request.ref,
    request.utmSource,
    request.utmMedium,
    request.utmCampaign,
    request.utmContent,
    request.utmTerm,
    request.mainSport,
    request.mainSportOther,
    request.sessionsPerWeek,
    request.sessionLength,
    request.trainWhere,
    request.hydrationGoal,
    request.hydrationGoalOther,
    request.runClub,
    joined(request.trainingTypes),
    request.trainingOther,
    request.trainingPrimary,
    request.heardFrom,
    request.heardFromOther,
    joined(request.whyReasons),
    request.whyOther,
    joined(request.hopes),
    request.hopesOther,
    request.willShare,
    request.createdAt,
    request.paidAt,
    request.shippedAt,
    request.deliveredAt,
    shipment?.waybillId,
    shipment?.status,
    feedback?.sessionType,
    feedback?.sessionLength,
    feedback?.tasteRating,
    joined(feedback?.felt),
    feedback?.feltOther,
    feedback?.wouldReachAgain,
    intentOf(feedback),
    feedback?.comment,
    feedback?.updatedAt,
  ].map(cell);
}

/** The founders' export: one line per request, UTF-8 with a BOM so Excel opens it cleanly. */
export function buildSampleCsv(rows: IExportRow[]): string {
  const lines = [SAMPLE_CSV_COLUMNS.join(","), ...rows.map((row) => rowValues(row).join(","))];

  return BOM + lines.join(LINE) + LINE;
}
