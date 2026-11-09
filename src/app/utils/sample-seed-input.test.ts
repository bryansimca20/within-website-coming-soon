import { describe, expect, test } from "vitest";

import { EMPTY_SAMPLE_REQUEST_INPUT, type ISampleRequestInput, SAMPLE_STEP_FIELDS } from "./sample-request-input";
import { parseSampleSeedInput, SEED_STEP_FIELDS, validateSeedStep } from "./sample-seed-input";

const VALID_SEED: ISampleRequestInput = {
  ...EMPTY_SAMPLE_REQUEST_INPUT,
  trainingTypes: "running,gym",
  trainingPrimary: "running",
  sessionsPerWeek: "three_to_four",
  sessionLength: "from_45_to_90",
  heardFrom: "instagram",
  whyReasons: "sweat_heat",
  hopes: "less_cramping",
  fullName: "Fanny Lie",
  email: "Fanny@Example.com",
  whatsapp: "0812 3456 7890",
  instagramHandle: "fanny.runs",
  consent: "on",
  ref: "event",
};

describe("parseSampleSeedInput", () => {
  test("accepts a submission with no address or courier", () => {
    const parsed = parseSampleSeedInput(VALID_SEED);

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value).toMatchObject({ email: "fanny@example.com", whatsapp: "+6281234567890", wantsLaunchEmail: true });
    expect(parsed.value.attribution.ref).toBe("event");
    expect(parsed.value).not.toHaveProperty("addressLine");
  });

  test("reports a missing WhatsApp on whatsapp", () => {
    expect(parseSampleSeedInput({ ...VALID_SEED, whatsapp: "" })).toMatchObject({ ok: false, field: "whatsapp" });
  });
});

describe("validateSeedStep", () => {
  test("step 5 asks only for WhatsApp", () => {
    expect(Object.keys(validateSeedStep(5, EMPTY_SAMPLE_REQUEST_INPUT))).toEqual(["whatsapp"]);
  });

  test("steps 1 to 4 are the public form's steps", () => {
    for (const step of [1, 2, 3, 4] as const) expect(SEED_STEP_FIELDS[step]).toBe(SAMPLE_STEP_FIELDS[step]);
  });
});
