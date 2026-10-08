/** The two tappable features on the dotted circle. */
export enum WaitlistFeatureId {
  Facts = "facts",
  Heat = "heat",
}

/** One feature tile: its two-line label, and the card it opens. */
export interface IWaitlistFeature {
  id: WaitlistFeatureId;
  labelLines: [string, string];
  cardLabel: string;
  cardTitle: string;
  cardBody: string;
}

/** One mineral's measured hourly sweat loss, and the top of the ruler it is plotted on. */
export interface IWaitlistSweatLoss {
  name: string;
  lowMg: number;
  highMg: number;
  axisMaxMg: number;
}

/** One row of the product facts card. */
export interface IWaitlistFactRow {
  name: string;
  amount: string;
}

/**
 * Every visitor-facing string on the waitlist page, kept in one place so an Indonesian set can
 * sit beside it later. Form error messages live with the validators in `subscriber-input.ts`.
 */
export const WAITLIST_COPY = {
  logoAlt: "WITHIN",
  instagramLabel: "WITHIN on Instagram, @withinrecovery",
  headline: "Take back what you lose in the heat.",
  subHeadline:
    "Electrolytes for training, recovery, and everything that comes after. Dosed to the milligram. Made in Indonesia. Built for the heat.",
  sachetAlt: "WITHIN orange electrolyte sachet",
  cta: "Join the waitlist for 10% off",
  ctaNote: "Coming soon. Your code arrives by email on launch day.",
  ctaJoined: "You are on the list",
  close: "Close",
  facts: {
    title: "Product facts",
    serving: "Per sachet",
    closeLabel: "Close product facts",
    electrolytesHeading: "ELECTROLYTES",
    sugarName: "Sugar",
    sugarAmount: "0 g",
    ingredientsName: "Clean ingredients",
    ingredientsAmount: "6",
    ingredients:
      "Sodium, potassium, magnesium, acidity regulator, natural flavoring, natural sweetener.",
  },
  heat: {
    rangeJoiner: "to",
    unit: "mg",
    lossHeading: "LOST IN SWEAT, PER HOUR OF HARD TRAINING",
    sourceNote: "Measured in runners at approx. 30°C and 70% relative humidity.",
    sourceLabel: "Surapongchai et al., Nutrients (2021)",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8072971/",
  },
  sheet: {
    label: "THE WAITLIST",
    title: "Get 10% off when we launch.",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "you@email.com",
    instagramLabel: "Instagram",
    instagramPlaceholder: "handle",
    submit: "Join the waitlist",
    submitting: "Joining",
    finePrint: "One email on launch day, with your code. Nothing in between.",
  },
  success: {
    label: "YOU ARE ON THE LIST",
    title: "Your 10% off is held for launch day.",
    bodyBeforeEmail: "We will send your code to ",
    bodyAfterEmail: ". Follow along on ",
    signOff: "see you soon",
    edit: "Edit my details",
  },
} as const;

/** The mineral rows of the product facts card. */
export const WAITLIST_ELECTROLYTES: IWaitlistFactRow[] = [
  { name: "Sodium", amount: "1,000 mg" },
  { name: "Potassium", amount: "250 mg" },
  { name: "Magnesium", amount: "50 mg" },
];

/** Measured sweat loss per hour, as a range. Carried over from the earlier page's research section. */
export const WAITLIST_SWEAT_LOSS: IWaitlistSweatLoss[] = [
  { name: "Sodium", lowMg: 900, highMg: 1250, axisMaxMg: 1600 },
  { name: "Potassium", lowMg: 125, highMg: 200, axisMaxMg: 400 },
];

/** Tile labels and card copy, in reading order: top left, then bottom right. */
export const WAITLIST_FEATURES: IWaitlistFeature[] = [
  {
    id: WaitlistFeatureId.Facts,
    labelLines: ["PRODUCT", "FACTS"],
    cardLabel: "PRODUCT FACTS",
    cardTitle: "Product facts",
    cardBody: "",
  },
  {
    id: WaitlistFeatureId.Heat,
    labelLines: ["MADE FOR", "THE HEAT"],
    cardLabel: "MADE FOR THE HEAT",
    cardTitle: "Built for Indonesian heat",
    cardBody:
      "Made for training in heat and humidity, where you sweat more and lose more. Give your body back what it spent.",
  },
];
