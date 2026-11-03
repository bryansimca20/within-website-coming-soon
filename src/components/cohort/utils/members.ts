/**
 * The WITHIN founding cohort. Names and portraits are real, supplied by the founder.
 * Order is alphabetical by first name; reorder this array to change it everywhere.
 *
 * No club or discipline is recorded here on purpose: those were not supplied, and the
 * cohort reads this page. Nothing is asserted about a member that we were not told.
 */

/** One handpicked founding member of the WITHIN cohort. */
export interface ICohortMember {
  /** Position in the cohort. Printed as the register number. */
  index: number;
  name: string;
  /** Portrait in `public/cohort/`. */
  portrait: string;
  /**
   * The `?ref=` value on a member's personal link. Permanent once a link is posted: renaming
   * it breaks every link already shared and splits that member's count across two tags.
   */
  slug: string;
}

/** The eight founding members, in cohort order. */
export const COHORT_MEMBERS: readonly ICohortMember[] = [
  { index: 1, name: "Fanny Lie", portrait: "/cohort/fanny-lie.jpg", slug: "fanny" },
  { index: 2, name: "Georgius Audrey Teja", portrait: "/cohort/georgius-audrey-teja.jpg", slug: "georgius" },
  { index: 3, name: "Marco Matius Ratunuman", portrait: "/cohort/marco-matius-ratunuman.jpg", slug: "marco" },
  { index: 4, name: "Maria Stephanie", portrait: "/cohort/maria-stephanie.jpg", slug: "maria" },
  { index: 5, name: "Melina Santoso", portrait: "/cohort/melina-santoso.jpg", slug: "melina" },
  { index: 6, name: "Theodore Daniel", portrait: "/cohort/theodore-daniel.jpg", slug: "theodore" },
  { index: 7, name: "Uncle Dee", portrait: "/cohort/uncle-dee.jpg", slug: "dee" },
  { index: 8, name: "Yudi Muliawan", portrait: "/cohort/yudi-muliawan.jpg", slug: "yudi" },
];

/** Register string for a member, e.g. `03 / 08`. Zero-padded, tabular by convention. */
export const memberRegister = (index: number) =>
  `${String(index).padStart(2, "0")} / ${String(COHORT_MEMBERS.length).padStart(2, "0")}`;

/** The eight referral slugs, for validating a `ref` value without pulling in the portraits. */
export const COHORT_SLUGS: readonly string[] = COHORT_MEMBERS.map((member) => member.slug);
