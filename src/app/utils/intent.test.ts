import { describe, expect, test } from "vitest";

import { groupIntent, IntentGroup } from "./intent";

describe("groupIntent", () => {
  test("a definite yes is hot", () => {
    expect(groupIntent("yes_definitely")).toBe(IntentGroup.Hot);
  });

  test("probably is warm", () => {
    expect(groupIntent("probably")).toBe(IntentGroup.Warm);
  });

  test("not sure and not for me are cold", () => {
    expect(groupIntent("not_sure")).toBe(IntentGroup.Cold);
    expect(groupIntent("not_for_me")).toBe(IntentGroup.Cold);
  });
});
