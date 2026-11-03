import { z } from "zod";

import { type IAttribution, sanitizeRef, sanitizeUtm } from "./attribution";
import { normalizeIndonesianPhone } from "./phone";
import {
  HEARD_FROM,
  type HeardFrom,
  HOPE,
  type Hope,
  SESSION_LENGTH,
  SESSIONS_PER_WEEK,
  type SessionLength,
  type SessionsPerWeek,
  TRAINING_TYPE,
  type TrainingType,
  WHY_REASON,
  type WhyReason,
} from "./sample-options";
import { normalizeEmail, normalizeFullName, normalizeInstagramHandle } from "./subscriber-input";
import { readFormField } from "./form-field";

/** Raw, untrusted request values exactly as they arrive from the form. Every field is a string. */
export interface ISampleRequestInput {
  /** Comma-joined option keys, as every multi-select is carried in the form. */
  trainingTypes: string;
  trainingOther: string;
  trainingPrimary: string;
  runClub: string;
  sessionsPerWeek: string;
  sessionLength: string;
  heardFrom: string;
  heardFromOther: string;
  whyReasons: string;
  whyOther: string;
  hopes: string;
  hopesOther: string;
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
  trainingTypes: TrainingType[];
  trainingOther: string | null;
  trainingPrimary: TrainingType;
  runClub: string | null;
  sessionsPerWeek: SessionsPerWeek;
  sessionLength: SessionLength;
  heardFrom: HeardFrom;
  heardFromOther: string | null;
  whyReasons: WhyReason[];
  whyOther: string | null;
  hopes: Hope[];
  hopesOther: string | null;
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
  /** Ticked "Email me when WITHIN launches": the only marketing consent a sampler gives. */
  wantsLaunchEmail: boolean;
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
  trainingTypes: "",
  trainingOther: "",
  trainingPrimary: "",
  runClub: "",
  sessionsPerWeek: "",
  sessionLength: "",
  heardFrom: "",
  heardFromOther: "",
  whyReasons: "",
  whyOther: "",
  hopes: "",
  hopesOther: "",
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
  trainingTypes: "Pick how you train.",
  trainingOther: "Tell us how you train.",
  trainingPrimary: "Pick the one you do most.",
  runClub: "Keep the club name under 200 characters.",
  sessionsPerWeek: "Pick how often you train.",
  sessionLength: "Pick a typical session length.",
  heardFrom: "Pick how you heard about us.",
  heardFromOther: "Tell us where you heard about us.",
  whyReasons: "Pick at least one reason.",
  whyOther: "Tell us your reason.",
  hopes: "Pick what you hope it does.",
  hopesOther: "Tell us what you hope for.",
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
  consent: "",
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
  2: ["trainingTypes", "trainingOther", "trainingPrimary", "runClub"],
  3: ["sessionsPerWeek", "sessionLength"],
  4: ["heardFrom", "heardFromOther", "whyReasons", "whyOther", "hopes", "hopesOther"],
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

/** Comma-joined option keys from a multi-select, empties dropped. Duplicates are kept so they can be refused. */
export function splitChoices(raw: string): string[] {
  return raw
    .split(",")
    .map((key) => key.trim())
    .filter((key) => key !== "");
}

/** A multi-select: at least one key, every key from `set`, none twice. */
export function multiChoice<T extends string>(set: readonly T[]) {
  return z
    .string()
    .transform(splitChoices)
    .refine((keys) => keys.length > 0 && new Set(keys).size === keys.length && keys.every((key) => (set as readonly string[]).includes(key)))
    .transform((keys) => keys as T[]);
}

/** Zod carries the shape rules; the normalizers from the waitlist carry email, name and handle. */
const sampleRequestShape = z.object({
    trainingTypes: multiChoice(TRAINING_TYPE),
    trainingOther: optionalText(100),
    trainingPrimary: z.string().trim(),
    runClub: optionalText(200),
    sessionsPerWeek: z.enum(SESSIONS_PER_WEEK),
    sessionLength: z.enum(SESSION_LENGTH),
    heardFrom: z.enum(HEARD_FROM),
    heardFromOther: optionalText(100),
    whyReasons: multiChoice(WHY_REASON),
    whyOther: optionalText(100),
    hopes: multiChoice(HOPE),
    hopesOther: optionalText(100),
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
    consent: z.string().transform((value) => value === "on"),
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

type Issue = { field: SampleRequestField; message: string };

/** Answers a single key or key list into whether it includes `other`. */
function hasOther(value: string | string[] | undefined): boolean {
  return Array.isArray(value) ? value.includes("other") : value === "other";
}

/** Cross-field rules: "Other" needs its text, and two or more ways of training need a primary that is one of them. */
function crossFieldIssues(value: {
  trainingTypes?: string[];
  trainingOther?: string | null;
  trainingPrimary?: string;
  heardFrom?: string;
  heardFromOther?: string | null;
  whyReasons?: string[];
  whyOther?: string | null;
  hopes?: string[];
  hopesOther?: string | null;
}): Issue[] {
  const issues: Issue[] = [];
  const pairs: Array<[string | string[] | undefined, string | null | undefined, SampleRequestField]> = [
    [value.trainingTypes, value.trainingOther, "trainingOther"],
    [value.heardFrom, value.heardFromOther, "heardFromOther"],
    [value.whyReasons, value.whyOther, "whyOther"],
    [value.hopes, value.hopesOther, "hopesOther"],
  ];
  for (const [answer, text, field] of pairs) {
    if (hasOther(answer) && (text ?? null) === null) issues.push({ field, message: SAMPLE_FIELD_ERROR[field] });
  }
  const types = value.trainingTypes;
  if (types !== undefined && types.length > 1 && !types.includes(value.trainingPrimary ?? "")) {
    issues.push({ field: "trainingPrimary", message: SAMPLE_FIELD_ERROR.trainingPrimary });
  }
  return issues;
}

const sampleRequestSchema = sampleRequestShape.superRefine((value, context) => {
  for (const issue of crossFieldIssues(value)) {
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
      trainingTypes: data.trainingTypes,
      trainingOther: data.trainingTypes.includes("other") ? data.trainingOther : null,
      trainingPrimary: data.trainingTypes.length === 1 ? data.trainingTypes[0] : (data.trainingPrimary as TrainingType),
      runClub: data.runClub,
      sessionsPerWeek: data.sessionsPerWeek,
      sessionLength: data.sessionLength,
      heardFrom: data.heardFrom,
      heardFromOther: data.heardFrom === "other" ? data.heardFromOther : null,
      whyReasons: data.whyReasons,
      whyOther: data.whyReasons.includes("other") ? data.whyOther : null,
      hopes: data.hopes,
      hopesOther: data.hopes.includes("other") ? data.hopesOther : null,
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
      wantsLaunchEmail: data.consent,
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
    for (const issue of crossFieldIssues(result.data)) {
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
