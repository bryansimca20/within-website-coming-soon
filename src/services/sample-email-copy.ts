/**
 * Every line of the four sampler emails. One screen each, brand voice: short, plain, no hype.
 * `{box}` is "No. 042", `{batch}` is "Batch 01"; the templates fill them in.
 */
export const SAMPLE_EMAIL_COPY = {
  rewardLine: "As thanks, you have priority on the first production batch.",
  signature: "WITHIN, Jakarta",
  statusLabel: "Your samples, any time:",
  paid: {
    subject: "You're in. {box} of {batch}.",
    paragraphs: [
      "Your samples are yours. Three sachets of WITHIN, before anyone else gets them.",
      "We pack and ship in runs from our office in BSD. You will hear from us again when the courier has it, with the tracking number.",
      "One thing we ask in return: after a few sessions, tell us how it went. Your samples come with a QR code that opens a short form. It takes less than 30 seconds.",
    ],
  },
  shipped: {
    subject: "Your samples are on their way. {box}.",
    intro: "The courier has your samples.",
    courierWithWaybill: "{courier} {service}, waybill {waybill}.",
    courierWithoutWaybill: "{courier} {service}. The waybill number follows once the courier scans it.",
    trackLabel: "Track it:",
    tip: "Best on sessions over 45 minutes. One sachet in 500 to 1000 ml of water. Less water for a saltier mix, more for a lighter one.",
  },
  delivered: {
    subject: "Your samples have landed. {box}.",
    paragraphs: [
      "Your samples are there. Open them when you train, not before.",
      "After a few sessions, tell us how it went. Taste, how you felt, whether you would reach for it again. It is the only thing we ask.",
    ],
    button: "Tell us how it went",
  },
  feedbackReceived: {
    subject: "Thank you. {box}.",
    paragraphs: [
      "We read every answer. Yours shapes what we say at launch, and how the next batch is made.",
      "Watch Instagram for the launch, then your inbox.",
    ],
  },
} as const;
