import { describe, expect, test } from "vitest";

import {
  EMPTY_SAMPLE_REQUEST_INPUT,
  type ISampleRequestInput,
  parseSampleRequestInput,
  readSampleRequestInput,
  SAMPLE_STEP_FIELDS,
  validateSampleStep,
} from "./sample-request-input";

const VALID_INPUT: ISampleRequestInput = {
  mainSport: "running",
  mainSportOther: "",
  sessionsPerWeek: "three_to_four",
  sessionLength: "from_45_to_90",
  trainWhere: "outdoors",
  hydrationGoal: "cramps",
  hydrationGoalOther: "",
  runClub: "Senayan Runners",
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
    expect(parsed.value.mainSportOther).toBeNull();
    expect(parsed.value.runClub).toBe("Senayan Runners");
  });

  test("requires the free-text sport when the sport is other", () => {
    const parsed = parseWith({ mainSport: "other", mainSportOther: "" });

    expect(parsed).toMatchObject({ ok: false, field: "mainSportOther" });
  });

  test("requires the free-text goal when the goal is other", () => {
    expect(parseWith({ hydrationGoal: "other", hydrationGoalOther: " " })).toMatchObject({
      ok: false,
      field: "hydrationGoalOther",
    });
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
  test("reports only step 1 errors for an empty step 1", () => {
    const errors = validateSampleStep(1, EMPTY_SAMPLE_REQUEST_INPUT);

    expect(Object.keys(errors).sort()).toEqual(
      SAMPLE_STEP_FIELDS[1].filter((field) => !["mainSportOther", "hydrationGoalOther", "runClub"].includes(field)).sort()
    );
  });

  test("returns no errors for a valid step 2", () => {
    expect(validateSampleStep(2, VALID_INPUT)).toEqual({});
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
