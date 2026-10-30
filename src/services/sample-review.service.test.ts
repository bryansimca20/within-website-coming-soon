import { describe, expect, test } from "vitest";

import { NOW } from "../../test/sample-fixtures";
import { type IReviewRow, summarizeReviews } from "./sample-review.service";

function row(patch: Partial<IReviewRow>): IReviewRow {
  return { id: "f", requestId: "r", batchId: "b02", name: "Putri", boxLabel: "B02-001", rating: null, headline: null, review: null, taste: null, effectiveness: null, felt: [], createdAt: NOW, ...patch };
}

describe("summarizeReviews", () => {
  test("averages stars, taste and effectiveness, and counts each star", () => {
    const summary = summarizeReviews([
      row({ rating: 5, taste: 4, effectiveness: 5 }),
      row({ rating: 4, taste: 5 }),
      row({ rating: 2 }),
    ]);

    expect(summary.rated).toBe(3);
    expect(summary.average).toBeCloseTo(11 / 3);
    expect(summary.distribution).toEqual([0, 0, 1, 0, 1, 1]);
    expect(summary.tasteAverage).toBe(4.5);
    expect(summary.effectivenessAverage).toBe(5);
  });

  test("old check-ins with no stars still count toward taste, and bad scores are ignored", () => {
    const summary = summarizeReviews([row({ rating: null, taste: 3 }), row({ rating: 9, taste: 0 })]);

    expect(summary.rated).toBe(0);
    expect(summary.average).toBeNull();
    expect(summary.tasteAverage).toBe(3);
  });

  test("felt counts are out of the rows that answered it", () => {
    const summary = summarizeReviews([row({ felt: ["more_energy", "less_cramping"] }), row({ felt: ["more_energy"] }), row({})]);

    expect(summary.feltAnswered).toBe(2);
    expect(summary.felt.more_energy).toBe(2);
    expect(summary.felt.less_cramping).toBe(1);
    expect(summary.felt.no_difference).toBe(0);
  });
});
