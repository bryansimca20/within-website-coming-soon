/**
 * Every line of the four sampler emails, in the order a sampler receives them. One voice: short,
 * warm, plain, no hype. `{name}` is the sampler's first name, `{batch}` the batch label ("Batch 01").
 */
export const SAMPLE_EMAIL_COPY = {
  footer: "You're getting this because you requested a WITHIN sample at getwithin.id. Reply to this email with any question and a person will answer.",
  place: "JAKARTA",
  // Bank-transfer batches only, sent the moment a box is held and again when the same email asks a second time.
  // `{amount}`, `{code}`, `{deadline}` (Jakarta time), `{hours}`. No `{name}`: it goes to whatever address was typed
  // before anyone has paid, so it never repeats text a stranger typed.
  paymentInstructions: {
    subject: "How to pay for your WITHIN samples",
    preheader: "Transfer {amount} with {code} in Berita Transfer before {deadline}.",
    preheaderPlain: "Your payment page has the bank details and your code.",
    headline: "Almost there.",
    paragraphs: [
      "Transfer {amount} for the courier before {deadline}, Jakarta time, and put {code} in Berita Transfer so we can match your payment.",
      "Then open your payment page, tap I've transferred, and send us the screenshot on WhatsApp. We confirm transfers within {hours} hours.",
    ],
    withoutTransfer: "Your payment page has the bank details, the amount and your code.",
    // Sent instead when they already tapped I've transferred: no account and no deadline, so nobody pays twice.
    reportedSubject: "We're checking your WITHIN transfer",
    reportedPreheader: "We confirm transfers within {hours} hours.",
    reportedHeadline: "We're checking your transfer.",
    reportedParagraphs: [
      "You told us you transferred {amount} with {code}. We confirm transfers within {hours} hours.",
      "If you haven't sent the screenshot yet, open your payment page and send it on WhatsApp.",
    ],
    bankLabel: "BANK",
    holderLabel: "ACCOUNT HOLDER",
    numberLabel: "ACCOUNT NUMBER",
    amountLabel: "AMOUNT",
    codeLabel: "BERITA TRANSFER",
    button: "Open your payment page",
  },
  paid: {
    subject: "{name}, you're in for {batch}",
    preheader: "A note from the small team making WITHIN in Jakarta.",
    headline: "Thank you, {name}.",
    paragraphs: [
      "For a long time, WITHIN was something only we had tried. Today that changes. You're one of the first people outside our team to try it.",
      "Use them in your training, then tell us honestly how it went. It's the only thing we ask.",
      "We'll let you know when they're on the way.",
    ],
    button: "See your samples",
  },
  shipped: {
    subject: "{name}, your samples are on the way",
    preheaderWithWaybill: "{courier} has them. Waybill {waybill}.",
    preheaderWithEta: "{courier} has them. Arriving in {eta}.",
    preheaderPlain: "Your samples are with the courier.",
    headline: "They're on the way, {name}.",
    withCourierAndEta: "Your samples are with {courier} and should reach you in {eta}.",
    withCourier: "Your samples are with {courier}.",
    withoutCourier: "Your samples are with the courier.",
    waybillLabel: "WAYBILL",
    waybillPending: "Your waybill number will follow as soon as the courier scans the parcel.",
    button: "Track your samples",
  },
  delivered: {
    subject: "{name}, your samples have arrived",
    preheader: "Try them on your next few sessions, then tell us how it went.",
    headline: "It's here, {name}.",
    paragraphs: [
      "Your samples have arrived. Try them on your next few sessions.",
      "Then tell us honestly how it went, with the button below or the QR code on the card. It takes under a minute, and it's the only thing we ask.",
    ],
    button: "Tell us how it went",
  },
  seeded: {
    subject: "Your WITHIN samples",
    preheader: "Try them over your next few sessions, then tell us how they went.",
    headline: "Your WITHIN samples.",
    paragraphs: [
      "Hi {name}, thanks for taking a box of WITHIN samples. Try them over your next few sessions, then tell us how they went. It takes two minutes.",
    ],
    button: "Check in",
  },
  feedbackReminder: {
    subject: "{name}, how were your samples?",
    preheader: "Tap a star to rate them. It takes under a minute.",
    headline: "How were your samples, {name}?",
    paragraphs: ["It's been a week since they arrived. Tap a star to rate them, then tell us how it went."],
    starLabel: "{stars} out of 5",
    low: "Poor",
    high: "Excellent",
    note: "Haven't tried them yet? No rush. These links keep working.",
  },
} as const;
