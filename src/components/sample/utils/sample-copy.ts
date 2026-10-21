import type {
  FeedbackFelt,
  FeedbackSession,
  HydrationGoal,
  MainSport,
  SessionLength,
  SessionsPerWeek,
  TrainWhere,
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
  mainSport: Record<MainSport, string>;
  sessionsPerWeek: Record<SessionsPerWeek, string>;
  sessionLength: Record<SessionLength, string>;
  trainWhere: Record<TrainWhere, string>;
  hydrationGoal: Record<HydrationGoal, string>;
  feedbackSession: Record<FeedbackSession, string>;
  felt: Record<FeedbackFelt, string>;
  wouldReachAgain: Record<WouldReachAgain, string>;
} = {
  mainSport: { running: "Running", cycling: "Cycling", gym: "Gym", padel: "Padel", other: "Other" },
  sessionsPerWeek: { one_to_two: "1 to 2", three_to_four: "3 to 4", five_plus: "5+" },
  sessionLength: { under_45: "Under 45 min", from_45_to_90: "45 to 90 min", over_90: "90+ min" },
  trainWhere: { outdoors: "Mostly outdoors", mix: "A mix", indoors: "Mostly indoors" },
  hydrationGoal: {
    energy: "More energy",
    cramps: "Fewer cramps",
    recovery: "Better recovery",
    hydration: "Just staying hydrated",
    other: "Other",
  },
  feedbackSession: { long_run: "Long run", short_run: "Short run", gym: "Gym", padel: "Padel", other: "Other" },
  felt: {
    more_energy: "More energy",
    less_cramping: "Less cramping",
    faster_recovery: "Faster recovery",
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
  steps: ["About you", "Your sport", "Your sessions", "Your goal", "Shipping"] as const,
  stepCounter: (step: number) => `Step ${step} of 5`,
  headings: {
    contact: "Who are the samples for?",
    sport: "What do you train for?",
    sessions: "How do you train?",
    goal: "What do you want most from your hydration?",
    shipping: "Where should we send it?",
  },
  continue: "Continue",
  back: "Back",
  opening: "Opening payment",
  training: {
    mainSport: "Main sport",
    mainSportOther: "Which sport?",
    sessionsPerWeek: "Sessions per week",
    sessionLength: "Typical session length",
    trainWhere: "Where you usually train",
    hydrationGoal: "What you want most from your hydration",
    hydrationGoalOther: "Tell us more",
    runClub: "Run club or community (optional)",
    runClubPlaceholder: "Club name",
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
    areaPlaceholder: "District, city or postal code",
    areaSearching: "Searching",
    areaEmpty: "No matching area. Try a district or postal code.",
    areaChange: "Change",
    addressLine: "Street address",
    addressPlaceholder: "Street, number, building, floor",
    deliveryNote: "Note for the courier (optional)",
    deliveryNotePlaceholder: "Gate code, landmark",
    willShare: "I promise to share my feedback after trying it.",
    willShareNote: "Your feedback matters. Your samples come with a QR code that opens a short form. It takes less than 30 seconds.",
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
      felt: "How did you feel during and after?",
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
