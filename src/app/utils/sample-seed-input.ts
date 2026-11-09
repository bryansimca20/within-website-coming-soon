import { sanitizeRef, sanitizeUtm } from "./attribution";
import {
  crossFieldIssues,
  FIELD_NAMES,
  firstIssue,
  type ISampleRequestInput,
  type ISampleRequestValues,
  SAMPLE_STEP_FIELDS,
  type SampleRequestField,
  type SampleStep,
  sampleRequestShape,
  validateFields,
} from "./sample-request-input";
import type { TrainingType } from "./sample-options";

/** What an in-person request never carries: the delivery address and the courier. */
type SeedOmitted =
  | "addressLine"
  | "deliveryNote"
  | "areaId"
  | "areaName"
  | "province"
  | "city"
  | "district"
  | "postalCode"
  | "courierCompany"
  | "courierType"
  | "courierServiceName"
  | "shippingFee"
  | "shippingEta";

/** A validated in-person request: the survey, contact and attribution, with no delivery. */
export type ISampleSeedValues = Omit<ISampleRequestValues, SeedOmitted>;

export type ParsedSampleSeed =
  | { ok: true; value: ISampleSeedValues }
  | { ok: false; field: SampleRequestField; message: string };

const SEED_OMITTED: SampleRequestField[] = [
  "addressLine", "deliveryNote", "areaId", "areaName", "province", "city", "district", "postalCode",
  "courierCompany", "courierType", "courierServiceName", "shippingFee", "shippingEta",
];

/** The seeding form's steps: the same first four as the public form, then WhatsApp alone. */
export const SEED_STEP_FIELDS: Record<SampleStep, SampleRequestField[]> = {
  1: SAMPLE_STEP_FIELDS[1],
  2: SAMPLE_STEP_FIELDS[2],
  3: SAMPLE_STEP_FIELDS[3],
  4: SAMPLE_STEP_FIELDS[4],
  5: ["whatsapp"],
};

const seedSchema = sampleRequestShape
  .pick(Object.fromEntries(FIELD_NAMES.filter((field) => !SEED_OMITTED.includes(field)).map((field) => [field, true])) as Record<SampleRequestField, true>)
  .superRefine((value, context) => {
    for (const issue of crossFieldIssues(value)) {
      context.addIssue({ code: "custom", path: [issue.field], message: issue.message });
    }
  });

/** Validates a whole in-person submission. Attribution is sanitized, never a reason to fail. */
export function parseSampleSeedInput(input: ISampleRequestInput): ParsedSampleSeed {
  const result = seedSchema.safeParse(input);
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
      willShare: data.willShare,
      wantsLaunchEmail: data.consent,
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

/** Errors for one step of the seeding form, keyed by field. */
export function validateSeedStep(step: SampleStep, input: ISampleRequestInput): Partial<Record<SampleRequestField, string>> {
  return validateFields(SEED_STEP_FIELDS[step], input);
}
