import { describe, expect, test } from "vitest";

import {
  EMPTY_SAMPLE_REQUEST_INPUT,
  type ISampleRequestInput,
  parseSampleRequestInput,
  readSampleRequestInput,
  SAMPLE_FIELD_ERROR,
  SAMPLE_STEP_FIELDS,
  validateSampleStep,
} from "./sample-request-input";

const VALID_INPUT: ISampleRequestInput = {
  trainingTypes: "running,gym",
  trainingOther: "",
  trainingPrimary: "running",
  runClub: "Senayan Runners",
  sessionsPerWeek: "three_to_four",
  sessionLength: "from_45_to_90",
  heardFrom: "instagram",
  heardFromOther: "",
  whyReasons: "sweat_heat,no_sugar",
  whyOther: "",
  hopes: "less_cramping,felt_hydrated",
  hopesOther: "",
  fullName: "Fanny Lie",
  email: "Fanny@Example.com",
  whatsapp: "0812 3456 7890",
  instagramHandle: "fanny.runs",
  addressLine: "Jl. Sudirman No. 12, Tower B, Lantai 3",
  deliveryNote: "Leave with security",
  areaId: "IDNP6IDNC148IDND843IDZ12250",
  areaName: "Pesanggrahan, Jakarta Selatan, DKI Jakarta. 12250",
  province: "DKI Jakarta",
  city: "Jakarta Selatan",
  district: "Pesanggrahan",
  postalCode: "12250",
  willShare: "on",
  consent: "on",
  courierCompany: "jne",
  courierType: "reg",
  courierServiceName: "JNE Regular",
  shippingFee: "10000",
  shippingEta: "2 to 3 days",
  ref: "fanny",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmContent: "",
  utmTerm: "",
};

function parseWith(patch: Partial<ISampleRequestInput>) {
  return parseSampleRequestInput({ ...VALID_INPUT, ...patch });
}

describe("parseSampleRequestInput", () => {
  test("normalizes a valid submission", () => {
    const parsed = parseSampleRequestInput(VALID_INPUT);

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.email).toBe("fanny@example.com");
    expect(parsed.value.firstName).toBe("Fanny");
    expect(parsed.value.lastName).toBe("Lie");
    expect(parsed.value.whatsapp).toBe("+6281234567890");
    expect(parsed.value.shippingFee).toBe(10000);
    expect(parsed.value.willShare).toBe(true);
    expect(parsed.value.attribution.ref).toBe("fanny");
    expect(parsed.value.runClub).toBe("Senayan Runners");
    expect(parsed.value.trainingTypes).toEqual(["running", "gym"]);
    expect(parsed.value.trainingPrimary).toBe("running");
    expect(parsed.value.whyReasons).toEqual(["sweat_heat", "no_sugar"]);
    expect(parsed.value.hopes).toEqual(["less_cramping", "felt_hydrated"]);
    expect(parsed.value.trainingOther).toBeNull();
  });

  test("primary defaults to the only pick", () => {
    const parsed = parseWith({ trainingTypes: "padel", trainingPrimary: "" });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.trainingPrimary).toBe("padel");
  });

  test("rejects duplicate or unknown keys", () => {
    expect(parseWith({ trainingTypes: "running,running" })).toMatchObject({ ok: false, field: "trainingTypes" });
    expect(parseWith({ trainingTypes: "running,skiing" })).toMatchObject({ ok: false, field: "trainingTypes" });
    expect(parseWith({ hopes: "more_energy,flying" })).toMatchObject({ ok: false, field: "hopes" });
  });

  test("Other needs its text, up to 100 characters", () => {
    expect(parseWith({ trainingTypes: "other", trainingPrimary: "", trainingOther: "" })).toMatchObject({ ok: false, field: "trainingOther" });
    expect(parseWith({ heardFrom: "other", heardFromOther: " " })).toMatchObject({ ok: false, field: "heardFromOther" });
    expect(parseWith({ whyReasons: "other", whyOther: "" })).toMatchObject({ ok: false, field: "whyOther" });
    expect(parseWith({ hopes: "other", hopesOther: "" })).toMatchObject({ ok: false, field: "hopesOther" });
    expect(parseWith({ hopes: "other", hopesOther: "x".repeat(101) })).toMatchObject({ ok: false, field: "hopesOther" });
    expect(parseWith({ hopes: "other", hopesOther: "Sleep better" }).ok).toBe(true);
  });

  test("requires consent", () => {
    expect(parseWith({ consent: "" })).toMatchObject({ ok: false, field: "consent" });
  });

  test("rejects a shipping fee that is not a positive integer", () => {
    expect(parseWith({ shippingFee: "abc" })).toMatchObject({ ok: false, field: "shippingFee" });
    expect(parseWith({ shippingFee: "0" })).toMatchObject({ ok: false, field: "shippingFee" });
  });

  test("rejects a postal code that is not five digits", () => {
    expect(parseWith({ postalCode: "1234" })).toMatchObject({ ok: false, field: "postalCode" });
  });

  test("requires an address of at least ten characters", () => {
    expect(parseWith({ addressLine: "Jl. A 1" })).toMatchObject({ ok: false, field: "addressLine" });
    expect(parseWith({ addressLine: "Jl. Abc 12" }).ok).toBe(true);
  });

  test("rejects an unknown option key", () => {
    expect(parseWith({ sessionsPerWeek: "lots" })).toMatchObject({ ok: false, field: "sessionsPerWeek" });
  });

  test("rejects a bad phone, email and handle on their own fields", () => {
    expect(parseWith({ whatsapp: "021 123" })).toMatchObject({ ok: false, field: "whatsapp" });
    expect(parseWith({ email: "nope" })).toMatchObject({ ok: false, field: "email" });
    expect(parseWith({ instagramHandle: "bad handle" })).toMatchObject({ ok: false, field: "instagramHandle" });
  });

  test("drops a bad ref instead of failing", () => {
    const parsed = parseWith({ ref: "Bad Ref!" });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.attribution.ref).toBeNull();
  });

  test("caps a long utm value", () => {
    const parsed = parseWith({ utmSource: "x".repeat(150) });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.attribution.utmSource).toHaveLength(100);
  });

  test("turns empty optional text into null", () => {
    const parsed = parseWith({ runClub: "  ", deliveryNote: "" });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.runClub).toBeNull();
    expect(parsed.value.deliveryNote).toBeNull();
  });
});

describe("validateSampleStep", () => {
  test("every request field except attribution belongs to exactly one step", () => {
    const owned = Object.values(SAMPLE_STEP_FIELDS).flat();
    const expected = Object.keys(EMPTY_SAMPLE_REQUEST_INPUT).filter((field) => !field.startsWith("utm") && field !== "ref");

    expect([...owned].sort()).toEqual([...expected].sort());
    expect(new Set(owned).size).toBe(owned.length);
  });

  test("step 1 asks for contact and consent, not phone", () => {
    expect(Object.keys(validateSampleStep(1, EMPTY_SAMPLE_REQUEST_INPUT)).sort()).toEqual([
      "consent",
      "email",
      "fullName",
      "instagramHandle",
    ]);
  });

  test("step 2 needs at least one way of training", () => {
    expect(validateSampleStep(2, EMPTY_SAMPLE_REQUEST_INPUT)).toEqual({ trainingTypes: SAMPLE_FIELD_ERROR.trainingTypes });
  });

  test("two picks need a primary that is one of them", () => {
    const two = { ...VALID_INPUT, trainingTypes: "running,gym" };
    expect(validateSampleStep(2, { ...two, trainingPrimary: "" })).toEqual({ trainingPrimary: SAMPLE_FIELD_ERROR.trainingPrimary });
    expect(validateSampleStep(2, { ...two, trainingPrimary: "cycling" })).toEqual({ trainingPrimary: SAMPLE_FIELD_ERROR.trainingPrimary });
    expect(validateSampleStep(2, { ...two, trainingPrimary: "gym" })).toEqual({});
  });

  test("step 3 needs frequency and length", () => {
    expect(Object.keys(validateSampleStep(3, EMPTY_SAMPLE_REQUEST_INPUT)).sort()).toEqual(["sessionLength", "sessionsPerWeek"]);
  });

  test("step 4 needs heard-from, a reason and a hope", () => {
    expect(Object.keys(validateSampleStep(4, EMPTY_SAMPLE_REQUEST_INPUT)).sort()).toEqual(["heardFrom", "hopes", "whyReasons"]);
  });

  test("step 5 owns the phone", () => {
    expect(validateSampleStep(5, { ...VALID_INPUT, whatsapp: "123" })).toEqual({ whatsapp: SAMPLE_FIELD_ERROR.whatsapp });
  });

  test("valid input passes every step", () => {
    for (const step of [1, 2, 3, 4, 5] as const) expect(validateSampleStep(step, VALID_INPUT)).toEqual({});
  });
});

describe("readSampleRequestInput", () => {
  test("reads every field as an empty string from an empty form", () => {
    expect(readSampleRequestInput(new FormData())).toEqual(EMPTY_SAMPLE_REQUEST_INPUT);
  });

  test("reads a posted field", () => {
    const formData = new FormData();
    formData.set("email", "a@b.co");

    expect(readSampleRequestInput(formData).email).toBe("a@b.co");
  });
});

describe("address length matches Midtrans", () => {
  test("rejects an address over 255 characters", () => {
    expect(parseWith({ addressLine: "x".repeat(256) })).toMatchObject({ ok: false, field: "addressLine" });
    expect(parseWith({ addressLine: "x".repeat(255) }).ok).toBe(true);
  });
});
