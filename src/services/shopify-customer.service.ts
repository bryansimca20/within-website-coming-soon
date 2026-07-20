import "server-only";

/** Result of attempting to add one address to the pre-launch list. */
export enum SubscribeOutcome {
  Created = "created",
  AlreadySubscribed = "already-subscribed",
  Failed = "failed",
}

/** A single `userErrors` entry returned by an Admin API mutation. */
export interface IShopifyUserError {
  field: string[] | null;
  message: string;
}

/** Validated values for one pre-launch signup, plus the moment consent was given. */
export interface IPrelaunchSubscriber {
  email: string;
  instagramHandle: string | null;
  consentedAt: string;
}

/** Shape of the `CustomerInput` we send to `customerCreate`. */
interface ICustomerInput {
  email: string;
  tags: string[];
  emailMarketingConsent: {
    marketingState: "SUBSCRIBED";
    marketingOptInLevel: "SINGLE_OPT_IN";
    consentUpdatedAt: string;
  };
  metafields?: Array<{
    namespace: string;
    key: string;
    type: string;
    value: string;
  }>;
}

const ADMIN_API_VERSION = "2026-07";

/** Segments the launch campaign. `coming-soon` records where the signup came from. */
const PRELAUNCH_TAGS = ["prelaunch", "coming-soon"];

/** Requires a matching metafield definition in Shopify admin to be visible in the UI. */
const INSTAGRAM_METAFIELD = { namespace: "custom", key: "instagram_handle" };

const DUPLICATE_EMAIL_MESSAGE = "email has already been taken";

const CREATE_CUSTOMER_MUTATION = `
  mutation CreatePrelaunchSubscriber($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

/** Reads a required server-side variable, failing loudly rather than sending a broken request. */
function requireEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

/** Writes pre-launch signups into Shopify as customers with email marketing consent. */
export class ShopifyCustomerService {
  /** Builds the `customerCreate` input. Consent is set inline so no unsubscribed window exists. */
  static buildCustomerInput(subscriber: IPrelaunchSubscriber): ICustomerInput {
    const input: ICustomerInput = {
      email: subscriber.email,
      tags: PRELAUNCH_TAGS,
      emailMarketingConsent: {
        marketingState: "SUBSCRIBED",
        marketingOptInLevel: "SINGLE_OPT_IN",
        consentUpdatedAt: subscriber.consentedAt,
      },
    };

    if (subscriber.instagramHandle !== null) {
      input.metafields = [
        {
          ...INSTAGRAM_METAFIELD,
          type: "single_line_text_field",
          value: subscriber.instagramHandle,
        },
      ];
    }

    return input;
  }

  /** A duplicate address is a success from the visitor's side; anything else is a real failure. */
  static interpretUserErrors(userErrors: IShopifyUserError[]): SubscribeOutcome {
    if (userErrors.length === 0) {
      return SubscribeOutcome.Created;
    }

    const allDuplicates = userErrors.every((userError) =>
      userError.message.toLowerCase().includes(DUPLICATE_EMAIL_MESSAGE)
    );

    return allDuplicates ? SubscribeOutcome.AlreadySubscribed : SubscribeOutcome.Failed;
  }

  /** Creates the customer. Never throws for expected outcomes; logs and reports failure instead. */
  static async createPrelaunchSubscriber(
    subscriber: IPrelaunchSubscriber
  ): Promise<SubscribeOutcome> {
    const storeDomain = requireEnv("SHOPIFY_STORE_DOMAIN");
    const accessToken = requireEnv("SHOPIFY_ADMIN_API_TOKEN");

    const response = await fetch(
      `https://${storeDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: CREATE_CUSTOMER_MUTATION,
          variables: { input: ShopifyCustomerService.buildCustomerInput(subscriber) },
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("[shopify] customerCreate HTTP failure", response.status, await response.text());
      return SubscribeOutcome.Failed;
    }

    const payload = await response.json();

    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      console.error("[shopify] customerCreate GraphQL errors", payload.errors);
      return SubscribeOutcome.Failed;
    }

    const userErrors: IShopifyUserError[] = payload.data?.customerCreate?.userErrors ?? [];
    const outcome = ShopifyCustomerService.interpretUserErrors(userErrors);

    if (outcome === SubscribeOutcome.Failed) {
      console.error("[shopify] customerCreate userErrors", userErrors);
    }

    return outcome;
  }
}
