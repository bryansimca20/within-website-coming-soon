import { describe, expect, test } from "vitest";

import { ShopifyCustomerService, SubscribeOutcome } from "./shopify-customer.service";

const CONSENTED_AT = "2026-07-20T00:00:00.000Z";

describe("ShopifyCustomerService.buildCustomerInput", () => {
  test("subscribes the address and tags it for launch-day segmentation", () => {
    const input = ShopifyCustomerService.buildCustomerInput({
      email: "bryan@example.com",
      instagramHandle: null,
      consentedAt: CONSENTED_AT,
    });

    expect(input).toEqual({
      email: "bryan@example.com",
      tags: ["prelaunch", "coming-soon"],
      emailMarketingConsent: {
        marketingState: "SUBSCRIBED",
        marketingOptInLevel: "SINGLE_OPT_IN",
        consentUpdatedAt: CONSENTED_AT,
      },
    });
  });

  test("omits the metafields key entirely when no handle was given", () => {
    const input = ShopifyCustomerService.buildCustomerInput({
      email: "bryan@example.com",
      instagramHandle: null,
      consentedAt: CONSENTED_AT,
    });

    expect(input).not.toHaveProperty("metafields");
  });

  test("attaches the handle as a custom.instagram_handle metafield", () => {
    const input = ShopifyCustomerService.buildCustomerInput({
      email: "bryan@example.com",
      instagramHandle: "within.id",
      consentedAt: CONSENTED_AT,
    });

    expect(input.metafields).toEqual([
      {
        namespace: "custom",
        key: "instagram_handle",
        type: "single_line_text_field",
        value: "within.id",
      },
    ]);
  });
});

describe("ShopifyCustomerService.interpretUserErrors", () => {
  test("no errors means the customer was created", () => {
    expect(ShopifyCustomerService.interpretUserErrors([])).toBe(SubscribeOutcome.Created);
  });

  test("a taken email means they already signed up", () => {
    const outcome = ShopifyCustomerService.interpretUserErrors([
      { field: ["email"], message: "Email has already been taken" },
    ]);

    expect(outcome).toBe(SubscribeOutcome.AlreadySubscribed);
  });

  test("matches the taken-email message regardless of casing", () => {
    const outcome = ShopifyCustomerService.interpretUserErrors([
      { field: ["email"], message: "EMAIL HAS ALREADY BEEN TAKEN" },
    ]);

    expect(outcome).toBe(SubscribeOutcome.AlreadySubscribed);
  });

  test("any other error is a failure", () => {
    const outcome = ShopifyCustomerService.interpretUserErrors([
      { field: ["email"], message: "Email is invalid" },
    ]);

    expect(outcome).toBe(SubscribeOutcome.Failed);
  });

  test("a taken email alongside a real error is still a failure", () => {
    const outcome = ShopifyCustomerService.interpretUserErrors([
      { field: ["email"], message: "Email has already been taken" },
      { field: ["metafields"], message: "Metafield definition not found" },
    ]);

    expect(outcome).toBe(SubscribeOutcome.Failed);
  });
});
