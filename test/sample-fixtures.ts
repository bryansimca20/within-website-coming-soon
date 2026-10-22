import type { ISampleRequestValues } from "@/app/utils/sample-request-input";
import { EMPTY_ATTRIBUTION } from "@/app/utils/attribution";

/** A valid, normalized request, as the validator would hand it to the repository. */
export function sampleValues(patch: Partial<ISampleRequestValues> = {}): ISampleRequestValues {
  return {
    trainingTypes: ["running", "hyrox"],
    trainingOther: null,
    trainingPrimary: "running",
    runClub: null,
    sessionsPerWeek: "three_to_four",
    sessionLength: "from_45_to_90",
    heardFrom: "instagram",
    heardFromOther: null,
    whyReasons: ["sweat_heat", "no_sugar"],
    whyOther: null,
    hopes: ["less_cramping", "felt_hydrated"],
    hopesOther: null,
    fullName: "Fanny Lie",
    firstName: "Fanny",
    lastName: "Lie",
    email: "fanny@example.com",
    whatsapp: "+6281234567890",
    instagramHandle: "fanny.runs",
    addressLine: "Jl. Sudirman No. 12",
    deliveryNote: null,
    areaId: "IDNP6IDNC148IDND843IDZ12250",
    areaName: "Pesanggrahan, Jakarta Selatan, DKI Jakarta. 12250",
    province: "DKI Jakarta",
    city: "Jakarta Selatan",
    district: "Pesanggrahan",
    postalCode: "12250",
    willShare: true,
    courierCompany: "jne",
    courierType: "reg",
    courierServiceName: "JNE Reguler",
    shippingFee: 10000,
    shippingEta: "2 to 3 days",
    attribution: { ...EMPTY_ATTRIBUTION, ref: "fanny" },
    ...patch,
  };
}

/** A fixed "now" so expiry maths is deterministic. */
export const NOW = new Date("2026-10-27T03:00:00.000Z");

/** Minutes after NOW. */
export function minutesAfter(minutes: number, from: Date = NOW): Date {
  return new Date(from.getTime() + minutes * 60_000);
}
