import { describe, expect, test } from "vitest";

import { INSTAGRAM_URL } from "@/lib/site";

import { type ISampleEmailContext, renderSampleEmail, SampleEmailKind } from "./sample-email-templates";

const CONTEXT: ISampleEmailContext = {
  firstName: "Fanny",
  batchLabel: "Batch 01",
  statusUrl: "https://within.id/sample/r/AbCdEfGhIjKlMnOpQrStUvWx",
  feedbackUrl: "https://within.id/sample/feedback?code=AbCdEfGhIjKlMnOpQrStUvWx",
  courier: {
    name: "JNE Reguler",
    eta: "1 to 2 days",
    waybillId: "JNE123456",
    trackingLink: "https://biteship.com/track/JNE123456",
  },
};

const KINDS = Object.values(SampleEmailKind);

describe("renderSampleEmail", () => {
  test.each([
    [SampleEmailKind.Paid, "Fanny, you're in for Batch 01", "Thank you, Fanny."],
    [SampleEmailKind.Shipped, "Fanny, your samples are on the way", "They're on the way, Fanny."],
    [SampleEmailKind.Delivered, "Fanny, your samples have arrived", "It's here, Fanny."],
    [SampleEmailKind.FeedbackReminder, "Fanny, how did your samples go?", "How did it go, Fanny?"],
    [SampleEmailKind.FeedbackReceived, "Fanny, thank you for telling us", "Thanks for telling us, Fanny."],
  ])("%s opens with the name in the subject and the headline", (kind, subject, headline) => {
    const email = renderSampleEmail(kind, CONTEXT);

    expect(email.subject).toBe(subject);
    expect(email.html).toContain(headline.replace("'", "&#39;"));
    expect(email.text.startsWith(headline)).toBe(true);
  });

  test.each(KINDS)("%s carries preview text, the batch label, and no box number, BSD or reward", (kind) => {
    const email = renderSampleEmail(kind, CONTEXT);

    expect(email.html).toContain("SAMPLE BATCH 01");
    expect(email.html).toMatch(/<div style="display:none;[^"]*">[^<]+<\/div>/);
    for (const banned of ["No. 0", "BSD", "priority", "As thanks", "—"]) {
      expect(email.html).not.toContain(banned);
      expect(email.text).not.toContain(banned);
    }
  });

  test("the order email sends them to their status page", () => {
    const email = renderSampleEmail(SampleEmailKind.Paid, CONTEXT);

    expect(email.html).toContain(CONTEXT.statusUrl);
    expect(email.text).toContain(CONTEXT.statusUrl);
    expect(email.text).toContain("It's the only thing we ask.");
  });

  test("the shipped email names the courier, the estimate, the waybill and the tracking link", () => {
    const email = renderSampleEmail(SampleEmailKind.Shipped, CONTEXT);

    expect(email.text).toContain("Your samples are with JNE Reguler and should reach you in 1 to 2 days.");
    expect(email.html).toContain("JNE123456");
    expect(email.text).toContain("JNE123456");
    expect(email.html).toContain(CONTEXT.courier?.trackingLink ?? "missing");
  });

  test("the shipped email explains a missing waybill and tracks through the status page instead", () => {
    const email = renderSampleEmail(SampleEmailKind.Shipped, {
      ...CONTEXT,
      courier: { name: "JNE Reguler", eta: "1 to 2 days", waybillId: null, trackingLink: null },
    });

    expect(email.text).toContain("Your waybill number will follow as soon as the courier scans the parcel.");
    expect(email.html).toContain(CONTEXT.statusUrl);
    expect(email.html).not.toContain("null");
  });

  test("the shipped email still reads well with no courier or estimate", () => {
    const email = renderSampleEmail(SampleEmailKind.Shipped, { ...CONTEXT, courier: null });

    expect(email.text).toContain("Your samples are with the courier.");
    expect(email.html).not.toContain("null");
  });

  test.each([SampleEmailKind.Delivered, SampleEmailKind.FeedbackReminder])("%s links the personal check-in", (kind) => {
    const email = renderSampleEmail(kind, CONTEXT);

    expect(email.html).toContain(CONTEXT.feedbackUrl);
    expect(email.text).toContain(CONTEXT.feedbackUrl);
    expect(email.text).toContain("less than 30 seconds");
  });

  test("the thank-you email points to Instagram", () => {
    const email = renderSampleEmail(SampleEmailKind.FeedbackReceived, CONTEXT);

    expect(email.html).toContain(INSTAGRAM_URL);
    expect(email.text).toContain(INSTAGRAM_URL);
  });

  test("escapes html in the first name", () => {
    const email = renderSampleEmail(SampleEmailKind.Paid, { ...CONTEXT, firstName: "<b>" });

    expect(email.html).toContain("&lt;b&gt;");
    expect(email.html).not.toContain("<b>");
  });
});
