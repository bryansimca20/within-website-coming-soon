import { z } from "zod";

import { type IAttribution, sanitizeRef, sanitizeUtm } from "./attribution";
import { normalizeIndonesianPhone } from "./phone";
import {
  HYDRATION_GOAL,
  type HydrationGoal,
  MAIN_SPORT,
  type MainSport,
  SESSION_LENGTH,
  SESSIONS_PER_WEEK,
  type SessionLength,
  type SessionsPerWeek,
  TRAIN_WHERE,
  type TrainWhere,
} from "./sample-options";
import { normalizeEmail, normalizeFullName, normalizeInstagramHandle } from "./subscriber-input";
import { readFormField } from "./form-field";

/** Raw, untrusted request values exactly as they arrive from the form. Every field is a string. */
export interface ISampleRequestInput {
  mainSport: string;
  mainSportOther: string;
  sessionsPerWeek: string;
  sessionLength: string;
  trainWhere: string;
  hydrationGoal: string;
  hydrationGoalOther: string;
  runClub: string;
  fullName: string;
  email: string;
  whatsapp: string;
  instagramHandle: string;
  addressLine: string;
  deliveryNote: string;
  areaId: string;
  areaName: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  willShare: string;
  consent: string;
  courierCompany: string;
  courierType: string;
  courierServiceName: string;
  shippingFee: string;
  shippingEta: string;
  ref: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
}

export type SampleRequestField = keyof ISampleRequestInput;

/** A validated, normalized request, ready to store. */
export interface ISampleRequestValues {
  mainSport: MainSport;
  mainSportOther: string | null;
  sessionsPerWeek: SessionsPerWeek;
  sessionLength: SessionLength;
  trainWhere: TrainWhere;
  hydrationGoal: HydrationGoal;
  hydrationGoalOther: string | null;
  runClub: string | null;
  fullName: string;
  firstName: string;
  lastName: string | null;
  email: string;
  whatsapp: string;
  instagramHandle: string;
  addressLine: string;
  deliveryNote: string | null;
  areaId: string;
  areaName: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  willShare: boolean;
  courierCompany: string;
  courierType: string;
  courierServiceName: string;
  shippingFee: number;
  shippingEta: string;
  attribution: IAttribution;
}

export type ParsedSampleRequest =
  | { ok: true; value: ISampleRequestValues }
  | { ok: false; field: SampleRequestField; message: string };

export const EMPTY_SAMPLE_REQUEST_INPUT: ISampleRequestInput = {
  mainSport: "",
  mainSportOther: "",
  sessionsPerWeek: "",
  sessionLength: "",
  trainWhere: "",
  hydrationGoal: "",
  hydrationGoalOther: "",
  runClub: "",
  fullName: "",
  email: "",
  whatsapp: "",
  instagramHandle: "",
  addressLine: "",
  deliveryNote: "",
  areaId: "",
  areaName: "",
  province: "",
  city: "",
  district: "",
  postalCode: "",
  willShare: "",
  consent: "",
  courierCompany: "",
  courierType: "",
  courierServiceName: "",
  shippingFee: "",
  shippingEta: "",
  ref: "",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmContent: "",
  utmTerm: "",
};

/** Field-level error copy, shared by the server validator and the form so they never drift. */
export const SAMPLE_FIELD_ERROR: Record<SampleRequestField, string> = {
  mainSport: "Pick your main sport.",
  mainSportOther: "Tell us which sport.",
  sessionsPerWeek: "Pick how often you train.",
  sessionLength: "Pick a typical session length.",
  trainWhere: "Pick where you usually train.",
  hydrationGoal: "Pick what you want most from hydration.",
  hydrationGoalOther: "Tell us what you want from hydration.",
  runClub: "Keep the club name under 200 characters.",
  fullName: "Add your name.",
  email: "Invalid email address.",
  whatsapp: "Add an Indonesian mobile number, like 0812 3456 7890.",
  instagramHandle: "Add your Instagram handle: letters, numbers, dots or underscores.",
  addressLine: "Add the full street address, 10 to 255 characters.",
  deliveryNote: "Keep the delivery note under 200 characters.",
  areaId: "Pick your area from the list.",
  areaName: "Pick your area from the list.",
  province: "Pick your area from the list.",
  city: "Pick your area from the list.",
  district: "Pick your area from the list.",
  postalCode: "Pick your area from the list.",
  willShare: "",
  consent: "Tick the box to join the waitlist.",
  courierCompany: "Pick a courier.",
  courierType: "Pick a courier.",
  courierServiceName: "Pick a courier.",
  shippingFee: "Pick a courier.",
  shippingEta: "Pick a courier.",
  ref: "",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmContent: "",
  utmTerm: "",
};

/** The five form steps after the intro: about you, sport, sessions, goal, shipping. */
export type SampleStep = 1 | 2 | 3 | 4 | 5;

/** The fields each step of the form owns, in display order. */
export const SAMPLE_STEP_FIELDS: Record<SampleStep, SampleRequestField[]> = {
  1: ["fullName", "email", "instagramHandle", "consent", "willShare"],
  2: ["mainSport", "mainSportOther", "runClub"],
  3: ["sessionsPerWeek", "sessionLength", "trainWhere"],
  4: ["hydrationGoal", "hydrationGoalOther"],
  5: [
    "areaId",
    "areaName",
    "province",
    "city",
    "district",
    "postalCode",
    "addressLine",
    "whatsapp",
    "deliveryNote",
    "courierCompany",
    "courierType",
    "courierServiceName",
    "shippingFee",
    "shippingEta",
  ],
};

const MAX_SHIPPING_FEE = 1_000_000;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value));

const requiredText = z.string().trim().min(1).max(200);

/** Zod carries the shape rules; the normalizers from the waitlist carry email, name and handle. */
const sampleRequestShape = z.object({
    mainSport: z.enum(MAIN_SPORT),
    mainSportOther: optionalText(100),
    sessionsPerWeek: z.enum(SESSIONS_PER_WEEK),
    sessionLength: z.enum(SESSION_LENGTH),
    trainWhere: z.enum(TRAIN_WHERE),
    hydrationGoal: z.enum(HYDRATION_GOAL),
    hydrationGoalOther: optionalText(100),
    runClub: optionalText(200),
    fullName: z.string().transform((value, context) => {
      const name = normalizeFullName(value);
      if (name === null) {
        context.addIssue({ code: "custom", message: SAMPLE_FIELD_ERROR.fullName });
        return z.NEVER;
      }
      return { fullName: value.trim().replace(/\s+/g, " "), ...name };
    }),
    email: z.string().transform((value, context) => {
      const email = normalizeEmail(value);
      if (email === null) {
        context.addIssue({ code: "custom", message: SAMPLE_FIELD_ERROR.email });
        return z.NEVER;
      }
      return email;
    }),
    whatsapp: z.string().transform((value, context) => {
      const phone = normalizeIndonesianPhone(value);
      if (phone === null) {
        context.addIssue({ code: "custom", message: SAMPLE_FIELD_ERROR.whatsapp });
        return z.NEVER;
      }
      return phone;
    }),
    instagramHandle: z.string().transform((value, context) => {
      const handle = normalizeInstagramHandle(value);
      if (handle === null) {
        context.addIssue({ code: "custom", message: SAMPLE_FIELD_ERROR.instagramHandle });
        return z.NEVER;
      }
      return handle;
    }),
    // Midtrans caps shipping_address.address at 255 characters; longer fails payment silently.
  addressLine: z.string().trim().min(10).max(255),
    deliveryNote: optionalText(200),
    areaId: requiredText,
    areaName: requiredText,
    province: requiredText,
    city: requiredText,
    district: requiredText,
    postalCode: z.string().trim().regex(/^\d{5}$/),
    willShare: z.string().transform((value) => value === "on"),
    consent: z.literal("on"),
    courierCompany: requiredText,
    courierType: requiredText,
    courierServiceName: requiredText,
    shippingFee: z
      .string()
      .trim()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().int().min(1).max(MAX_SHIPPING_FEE)),
    shippingEta: requiredText,
    ref: z.string(),
    utmSource: z.string(),
    utmMedium: z.string(),
    utmCampaign: z.string(),
    utmContent: z.string(),
    utmTerm: z.string(),
});

/** The "other" free-text fields are required only when their parent option is `other`. */
function otherFieldIssues(value: {
  mainSport?: string;
  mainSportOther?: string | null;
  hydrationGoal?: string;
  hydrationGoalOther?: string | null;
}): Array<{ field: SampleRequestField; message: string }> {
  const issues: Array<{ field: SampleRequestField; message: string }> = [];
  if (value.mainSport === "other" && (value.mainSportOther ?? null) === null) {
    issues.push({ field: "mainSportOther", message: SAMPLE_FIELD_ERROR.mainSportOther });
  }
  if (value.hydrationGoal === "other" && (value.hydrationGoalOther ?? null) === null) {
    issues.push({ field: "hydrationGoalOther", message: SAMPLE_FIELD_ERROR.hydrationGoalOther });
  }
  return issues;
}

const sampleRequestSchema = sampleRequestShape.superRefine((value, context) => {
  for (const issue of otherFieldIssues(value)) {
    context.addIssue({ code: "custom", path: [issue.field], message: issue.message });
  }
});

const FIELD_NAMES = Object.keys(EMPTY_SAMPLE_REQUEST_INPUT) as SampleRequestField[];

function isSampleRequestField(name: unknown): name is SampleRequestField {
  return typeof name === "string" && (FIELD_NAMES as string[]).includes(name);
}


/** Every request field from posted form data, missing ones as empty strings. */
export function readSampleRequestInput(formData: FormData): ISampleRequestInput {
  const input = { ...EMPTY_SAMPLE_REQUEST_INPUT };
  for (const field of FIELD_NAMES) {
    input[field] = readFormField(formData, field);
  }

  return input;
}

/** The first failing field in form order, with that field's own message. */
function firstIssue(issues: z.ZodError["issues"]): { field: SampleRequestField; message: string } {
  const sorted = [...issues].sort(
    (a, b) => FIELD_NAMES.indexOf(a.path[0] as SampleRequestField) - FIELD_NAMES.indexOf(b.path[0] as SampleRequestField)
  );
  const issue = sorted[0];
  const field = isSampleRequestField(issue?.path[0]) ? issue.path[0] : "email";

  return { field, message: SAMPLE_FIELD_ERROR[field] || "Check this field." };
}

/** Validates a whole submission. Attribution is sanitized, never a reason to fail. */
export function parseSampleRequestInput(input: ISampleRequestInput): ParsedSampleRequest {
  const result = sampleRequestSchema.safeParse(input);
  if (!result.success) {
    const { field, message } = firstIssue(result.error.issues);
    return { ok: false, field, message };
  }

  const data = result.data;

  return {
    ok: true,
    value: {
      mainSport: data.mainSport,
      mainSportOther: data.mainSport === "other" ? data.mainSportOther : null,
      sessionsPerWeek: data.sessionsPerWeek,
      sessionLength: data.sessionLength,
      trainWhere: data.trainWhere,
      hydrationGoal: data.hydrationGoal,
      hydrationGoalOther: data.hydrationGoal === "other" ? data.hydrationGoalOther : null,
      runClub: data.runClub,
      fullName: data.fullName.fullName,
      firstName: data.fullName.firstName,
      lastName: data.fullName.lastName,
      email: data.email,
      whatsapp: data.whatsapp,
      instagramHandle: data.instagramHandle,
      addressLine: data.addressLine,
      deliveryNote: data.deliveryNote,
      areaId: data.areaId,
      areaName: data.areaName,
      province: data.province,
      city: data.city,
      district: data.district,
      postalCode: data.postalCode,
      willShare: data.willShare,
      courierCompany: data.courierCompany,
      courierType: data.courierType,
      courierServiceName: data.courierServiceName,
      shippingFee: data.shippingFee,
      shippingEta: data.shippingEta,
      attribution: {
        ref: sanitizeRef(data.ref),
        utmSource: sanitizeUtm(data.utmSource),
        utmMedium: sanitizeUtm(data.utmMedium),
        utmCampaign: sanitizeUtm(data.utmCampaign),
        utmContent: sanitizeUtm(data.utmContent),
        utmTerm: sanitizeUtm(data.utmTerm),
      },
    },
  };
}

/** Errors for one step only, keyed by field, so the form can stop a visitor before they move on. */
export function validateSampleStep(
  step: SampleStep,
  input: ISampleRequestInput
): Partial<Record<SampleRequestField, string>> {
  const fields = SAMPLE_STEP_FIELDS[step];
  const stepSchema = sampleRequestShape.pick(
    Object.fromEntries(fields.map((field) => [field, true])) as Record<SampleRequestField, true>
  );
  const result = stepSchema.safeParse(input);
  const errors: Partial<Record<SampleRequestField, string>> = {};

  if (result.success) {
    for (const issue of otherFieldIssues(result.data)) {
      if (fields.includes(issue.field)) errors[issue.field] = issue.message;
    }
    return errors;
  }

  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (isSampleRequestField(field) && errors[field] === undefined) {
      errors[field] = SAMPLE_FIELD_ERROR[field] || "Check this field.";
    }
  }

  return errors;
}
