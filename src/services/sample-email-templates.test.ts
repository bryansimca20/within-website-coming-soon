import { describe, expect, test } from "vitest";

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
    [SampleEmailKind.FeedbackReminder, "Fanny, how were your samples?", "How were your samples, Fanny?"],
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

  test("the delivered email links the personal review with a button", () => {
    const email = renderSampleEmail(SampleEmailKind.Delivered, CONTEXT);

    expect(email.html).toContain(CONTEXT.feedbackUrl);
    expect(email.text).toContain(`Tell us how it went: ${CONTEXT.feedbackUrl}`);
    expect(email.text).toContain("under a minute");
  });

  test("the reminder has five stars, each opening the review with its rating, and no button", () => {
    const email = renderSampleEmail(SampleEmailKind.FeedbackReminder, CONTEXT);

    for (let stars = 1; stars <= 5; stars += 1) {
      const href = `${CONTEXT.feedbackUrl}&rating=${stars}`;
      expect(email.html).toContain(`href="${href.replace("&", "&amp;")}"`);
      expect(email.html).toContain(`aria-label="${stars} out of 5"`);
      expect(email.text).toContain(`${stars} out of 5: ${href}`);
    }
    expect(email.html.match(/&#9734;/g)).toHaveLength(5);
    expect(email.html).not.toContain("&rarr;");
    expect(email.text).toContain("These links keep working.");
  });

  test("escapes html in the first name", () => {
    const email = renderSampleEmail(SampleEmailKind.Paid, { ...CONTEXT, firstName: "<b>" });

    expect(email.html).toContain("&lt;b&gt;");
    expect(email.html).not.toContain("<b>");
  });
});
