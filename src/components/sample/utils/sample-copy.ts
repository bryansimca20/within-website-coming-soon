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

export function formatClaimed(claimed: number, capacity: number): string {
  return `${claimed} of ${capacity} claimed`;
}

export function formatPayButton(amount: number): string {
  return `Pay shipping ${formatRupiah(amount)}`;
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
  batchLabel: "LIMITED SAMPLE BATCH 01",
  headline: "Three sachets, before launch.",
  trade:
    "100 boxes for people who train in the heat. The sample is free, you cover the courier. In return, tell us how it went.",
  shippingHint: "Shipping in Jabodetabek is usually around Rp 10.000. You see the exact price before you pay.",
  steps: ["Your training", "Where to send it", "Shipping"] as const,
  stepCounter: (step: number) => `Step ${step} of 3`,
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
    whatsapp: "WhatsApp",
    whatsappPlaceholder: "0812 3456 7890",
    whatsappHint: "Only for delivery updates.",
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
    willShare: "I'll share how it went after trying.",
    consent: "Add me to the WITHIN waitlist and send me launch updates.",
  },
  shipping: {
    loading: "Getting courier prices",
    noCourier: "No courier serves this area right now.",
    changeAddress: "Change the address",
    failed: "Could not load courier prices.",
    retry: "Try again",
    sendTo: "Sending to",
  },
  closed: {
    headline: "Batch 01 is claimed.",
    body: "All 100 boxes are spoken for. Join the waitlist and hear first when the next batch opens.",
    cta: "Join the waitlist",
  },
  already: {
    headline: "You already have a box.",
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
    holdLeft: (text: string) => `Your box is held for ${text}.`,
    payNow: "Pay now",
    payFallback: "Open the payment page",
    lapsedBody: "The payment window closed and the box went back to the batch.",
    lapsedCta: "Request again",
    feedbackLabel: "ONE THING WE ASK",
    feedbackBody: "After a few sessions, tell us how it went. It takes about a minute.",
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
    emailLabel: "The email you requested your box with",
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
