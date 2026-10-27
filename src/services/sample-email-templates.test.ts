import { describe, expect, test } from "vitest";

import { SAMPLE_EMAIL_COPY } from "./sample-email-copy";
import { type ISampleEmailContext, renderSampleEmail, SampleEmailKind } from "./sample-email-templates";

const CONTEXT: ISampleEmailContext = {
  firstName: "Fanny",
  boxWord: "No. 042",
  batchLabel: "Batch 01",
  statusUrl: "https://within.id/sample/r/AbCdEfGhIjKlMnOpQrStUvWx",
  feedbackUrl: "https://within.id/sample/feedback?code=AbCdEfGhIjKlMnOpQrStUvWx",
  courier: {
    name: "JNE",
    service: "Reguler",
    waybillId: "JNE123456",
    trackingLink: "https://biteship.com/track/JNE123456",
  },
};

const KINDS = Object.values(SampleEmailKind);

describe("renderSampleEmail", () => {
  test.each(KINDS)("%s subject names the box", (kind) => {
    expect(renderSampleEmail(kind, CONTEXT).subject).toContain("No. 042");
  });

  test("the paid email links to the status page in html and text", () => {
    const email = renderSampleEmail(SampleEmailKind.Paid, CONTEXT);

    expect(email.html).toContain(CONTEXT.statusUrl);
    expect(email.text).toContain(CONTEXT.statusUrl);
    expect(email.subject).toBe("You're in. No. 042 of Batch 01.");
  });

  test("the feedback reminder links the personal check-in in html and text", () => {
    const email = renderSampleEmail(SampleEmailKind.FeedbackReminder, CONTEXT);

    expect(email.subject).toBe("How did your samples go? No. 042.");
    expect(email.html).toContain(CONTEXT.feedbackUrl);
    expect(email.text).toContain(CONTEXT.feedbackUrl);
    expect(email.text).toContain("less than 30 seconds");
  });

  test("the shipped email carries the waybill and tracking link", () => {
    const email = renderSampleEmail(SampleEmailKind.Shipped, CONTEXT);

    expect(email.html).toContain("JNE123456");
    expect(email.html).toContain(CONTEXT.courier?.trackingLink ?? "");
    expect(email.text).toContain("JNE123456");
  });

  test("the shipped email still names the courier when there is no waybill yet", () => {
    const email = renderSampleEmail(SampleEmailKind.Shipped, {
      ...CONTEXT,
      courier: { name: "JNE", service: "Reguler", waybillId: null, trackingLink: null },
    });

    expect(email.html).toContain("JNE");
    expect(email.html).not.toContain("null");
  });

  test("the delivered email links to the personal feedback form", () => {
    const email = renderSampleEmail(SampleEmailKind.Delivered, CONTEXT);

    expect(email.html).toContain(CONTEXT.feedbackUrl);
    expect(email.text).toContain(CONTEXT.feedbackUrl);
  });

  test("the thank-you and reminder emails make no priority promise", () => {
    for (const kind of [SampleEmailKind.FeedbackReceived, SampleEmailKind.FeedbackReminder]) {
      const email = renderSampleEmail(kind, CONTEXT);
      expect(email.text).not.toContain(SAMPLE_EMAIL_COPY.rewardLine);
      expect(email.text.toLowerCase()).not.toContain("priority");
    }
  });

  test("escapes html in the first name", () => {
    const email = renderSampleEmail(SampleEmailKind.Paid, { ...CONTEXT, firstName: "<b>" });

    expect(email.html).toContain("&lt;b&gt;");
    expect(email.html).not.toContain("<b>");
  });
});
