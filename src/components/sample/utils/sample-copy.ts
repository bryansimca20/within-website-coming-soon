import type {
  FeedbackFelt,
  FeedbackSession,
  HeardFrom,
  Hope,
  SessionLength,
  SessionsPerWeek,
  TrainingType,
  WhyReason,
  WouldReachAgain,
} from "@/app/utils/sample-options";

/** "Rp 10.000": dot thousands, no decimals. */
export function formatRupiah(amount: number): string {
  return `Rp ${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export function formatPayButton(amount: number): string {
  return `Pay shipping ${formatRupiah(amount)}`;
}

/** Chip options for one closed answer set, in the set's order. */
export function choiceOptions<T extends string>(keys: readonly T[], labels: Record<T, string>) {
  return keys.map((value) => ({ value, label: labels[value] }));
}

/** Answer labels per option set, keyed by the stored option key. */
export const OPTION_LABEL: {
  trainingType: Record<TrainingType, string>;
  sessionsPerWeek: Record<SessionsPerWeek, string>;
  sessionLength: Record<SessionLength, string>;
  heardFrom: Record<HeardFrom, string>;
  whyReason: Record<WhyReason, string>;
  hope: Record<Hope, string>;
  feedbackSession: Record<FeedbackSession, string>;
  felt: Record<FeedbackFelt, string>;
  wouldReachAgain: Record<WouldReachAgain, string>;
} = {
  trainingType: {
    running: "Running",
    hyrox: "Hyrox / hybrid",
    gym: "Gym / strength",
    cycling: "Cycling",
    padel: "Padel",
    other: "Other",
  },
  sessionsPerWeek: { one_to_two: "1 to 2", three_to_four: "3 to 4", five_plus: "5+" },
  sessionLength: { under_45: "Under 45 min", from_45_to_90: "45 to 90 min", over_90: "90+ min" },
  heardFrom: {
    friend: "A friend or someone I train with",
    founding_member: "A WITHIN founding member",
    instagram: "Instagram",
    community: "My club, crew or community",
    other: "Other",
  },
  whyReason: {
    sweat_heat: "I sweat a lot in the heat",
    cramps_fade: "I get cramps or fade on long sessions",
    current_drink: "My current drink doesn't work well enough",
    no_sugar: "I want something without sugar",
    recommended: "Someone I trust recommended it",
    local_brand: "I like trying new local brands",
    other: "Other",
  },
  hope: {
    more_energy: "More energy",
    less_cramping: "Fewer cramps",
    faster_recovery: "Faster recovery",
    felt_hydrated: "Feel properly hydrated",
    other: "Other",
  },
  feedbackSession: { long_run: "Long run", short_run: "Short run", gym: "Gym", padel: "Padel", other: "Other" },
  felt: {
    more_energy: "More energy",
    less_cramping: "Less cramping",
    faster_recovery: "Faster recovery",
    felt_hydrated: "Felt properly hydrated",
    no_difference: "No difference",
    other: "Other",
  },
  wouldReachAgain: {
    yes_definitely: "Yes, definitely",
    probably: "Probably",
    not_sure: "Not sure",
    not_for_me: "Not for me",
  },
};

/** Every visitor-facing string on the sample pages. Validation errors live with the validators. */
export const SAMPLE_COPY = {
  intro: {
    label: "SAMPLE BATCH 01",
    headline: "Be one of the first 100 to train with it.",
    why: "We're not on sale yet, but we wanted you to try it first. Your feedback matters to us.",
    offerBefore: "You'll get ",
    offerBold: "3 sachets",
    offerAfter: " as your samples. Just cover the shipping.",
    cta: "Claim my samples",
    note: "Takes about 2 minutes. You see the shipping cost before you pay.",
  },
  steps: ["About you", "Your training", "Your sessions", "You and WITHIN", "Shipping"] as const,
  stepCounter: (step: number) => `Step ${step} of 5`,
  headings: {
    contact: "Who are the samples for?",
    training: "How do you train?",
    sessions: "How much do you train?",
    within: "What brings you to WITHIN?",
    shipping: "Where should we send it?",
  },
  continue: "Continue",
  back: "Back",
  opening: "Opening payment",
  payShipping: "Pay shipping",
  training: {
    trainingTypes: "Pick all that apply.",
    trainingPrimary: "Which do you do most?",
    runClub: "Club, crew or community (optional)",
    runClubPlaceholder: "Club or crew name",
    sessionsPerWeek: "How many times a week do you train, all together?",
    sessionLength: "How long is a typical session?",
    heardFrom: "How did you hear about us?",
    whyReasons: "Why do you want to try it? Pick all that apply.",
    hopes: "What do you hope it does for you? Pick all that apply.",
    other: "Tell us more",
  },
  delivery: {
    fullName: "Name",
    fullNamePlaceholder: "Your full name",
    email: "Email",
    emailPlaceholder: "you@email.com",
    emailHint: "We'll send your payment receipt and tracking link here.",
    whatsapp: "Phone",
    whatsappPlaceholder: "0812 3456 7890",
    whatsappHint: "For the courier only.",
    instagram: "Instagram",
    instagramPlaceholder: "handle",
    area: "Area",
    postalCode: "Postal code",
    areaPlaceholder: "e.g. 12110",
    areaSearching: "Searching",
    areaEmpty: "No area found for this postal code. Check the five digits.",
    areaChange: "Change",
    addressLine: "Street address",
    addressPlaceholder: "Street, number, building, floor",
    deliveryNote: "Note for the courier (optional)",
    deliveryNotePlaceholder: "Gate code, landmark",
    willShare: "I promise to share my feedback after trying it.",
    willShareNote: "Your samples come with a QR code that opens a short feedback form. It takes less than 30 seconds.",
    consent: "Add me to the WITHIN waitlist and send me launch updates.",
  },
  shipping: {
    pickArea: "Pick your area to see courier prices.",
    loading: "Getting courier prices",
    noCourier: "No courier serves this area right now.",
    failed: "Could not load courier prices.",
    retry: "Try again",
  },
  closed: {
    headline: "Batch 01 is claimed.",
    body: "Every sample in this batch is spoken for. Join the waitlist and hear first when the next batch opens.",
    cta: "Join the waitlist",
  },
  already: {
    headline: "You've already claimed your samples.",
    body: (email: string) => `We sent your status link to ${email} again.`,
  },
  status: {
    youreIn: (name: string) => `You're in, ${name}.`,
    almost: (name: string) => `Almost there, ${name}.`,
    lapsedHeadline: (name: string) => `Your hold has lapsed, ${name}.`,
    cancelledHeadline: "This request was cancelled.",
    boxOf: (box: string, batch: string) => `${box} of ${batch}`,
    steps: { requested: "Requested", paid: "Paid", shipped: "Shipped", delivered: "Delivered" },
    payLabel: "Shipping to pay",
    holdLeft: (text: string) => `Your samples are held for ${text}.`,
    payNow: "Pay now",
    payFallback: "Open the payment page",
    lapsedBody: "The payment window closed and your samples went back to the batch.",
    lapsedCta: "Request again",
    feedbackLabel: "ONE THING WE ASK",
    feedbackBody: "After a few sessions, tell us how it went. It takes less than 30 seconds.",
    feedbackCta: "Tell us how it went",
    feedbackDone: "Thanks, we have your feedback.",
    deliveryHeading: "DELIVERY",
    track: "Track the parcel",
    waybill: (id: string) => `Waybill ${id}`,
  },
  feedback: {
    label: "ONE THING WE ASK",
    headline: "How did it go?",
    headlineNamed: (name: string) => `How did it go, ${name}?`,
    emailLabel: "The email you claimed your samples with",
    emailPlaceholder: "you@email.com",
    progress: (step: number, total: number) => `${step} of ${total}`,
    questions: {
      sessionType: "What session did you take it on?",
      sessionLength: "How long was it?",
      tasteRating: "How did it taste?",
      felt: "How did you feel during and after? Pick all that apply.",
      feltOther: "Tell us more",
      wouldReachAgain: "Would you reach for it again on your next long or hot session?",
      comment: "Anything you'd like to tell us? (optional)",
    },
    tasteLow: "Not for me",
    tasteHigh: "Loved it",
    submit: "Send",
    submitting: "Sending",
    thanksHeadline: "Thank you.",
    thanksBody: "Your feedback shapes the launch. As thanks, you have priority on the first production batch.",
  },
} as const;
