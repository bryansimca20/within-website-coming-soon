@AGENTS.md

# CLAUDE.md — WITHIN Coming Soon

Guidelines for the WITHIN pre-launch site. Inherits and extends [../CLAUDE.md](../CLAUDE.md). One Next.js app holds both the frontend and the backend, so the rules for both live here. Details of how each area works live in the [reference docs](#reference-docs).

## Project Overview

WITHIN is an Indonesian electrolyte brand (BPOM and Halal certifications pending). This site serves the waitlist on `/`, the founding-member preview on `/cohort`, the paid-shipping sampling program on `/sample`, and a founder admin on `/admin`. It deploys to Vercel. The storefront is a separate repo (`../within-website`) that shares this Shopify store.

Optimizes for: **trust in what we claim and how we treat a visitor's data**, **no lost money or orders** (payment, shipping and email must survive retries and third-party failure), and **minimal dependencies**. Guiding principle: when a decision could double-charge, oversell a batch, leak who has signed up, or put an unverified claim on the page, surface it and stop.

## Commands

```bash
npm run dev           # Dev server (Turbopack) on http://localhost:3000
npm run build         # Production build
npm run start         # Serve the production build
npm run lint          # ESLint
npm run test          # Vitest once
npm run test:watch    # Vitest watch mode
npx tsc --noEmit      # Type-check (Vitest does not)
npm run db:generate   # Generate a Drizzle migration from src/db/schema.ts
npm run db:migrate    # Apply migrations to DATABASE_URL
```

Package manager is **npm**. Do not introduce another lockfile.

## Environment

Node `>= 20.9`. Secrets live in `.env.local` locally and in Vercel settings for Production + Preview. Every key and third-party setup step is in [docs/environment.md](docs/environment.md); keep that list current. Do not add a new env var without asking. Only values that are public by design get `NEXT_PUBLIC_`.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict. This Next.js has breaking changes: read the guide in `node_modules/next/dist/docs/` before writing framework code.
- **Styling:** Tailwind CSS 4, configured in CSS through `@theme` in [globals.css](src/app/globals.css) · shadcn/ui (`base-nova`, on Base UI rather than Radix) · `@phosphor-icons/react`
- **Motion and 3D:** `motion` · `three`
- **Data:** Postgres (Neon) · Drizzle ORM · **Testing:** Vitest + PGlite
- **Third parties:** Shopify Admin API · Midtrans · Biteship · Resend · BotID · Vercel Analytics and Cron
- **Auth:** `iron-session` founder cookie, no user accounts · **Forms:** native forms + Server Actions, `zod` on the sampling forms

**Do NOT use without asking:**
- A data-fetching library or global state library. Reads happen on the server; client state stays local.
- A second ORM or raw query layer alongside Drizzle.
- `lucide-react` in app code. It stays inside shadcn primitives.
- Any new dependency when the platform or an installed one does the job.

## Architecture

```
src/
  app/                 Routes, plus the API routes for webhooks, cron and sampling proxies
    actions/           Server Actions, <verb>.action.ts, orchestration only
    utils/             Pure helpers: validation, form state, option keys
  components/
    <domain>/          waitlist/, sample/, admin/, cohort/, brand/, coming-soon/ (shared motion)
      svg/  utils/     Domain-local SVG primitives and .ts helpers
    ui/                shadcn primitives, restyled and owned in this repo
  services/            <noun>.service.ts: third-party calls and database logic
  db/                  Drizzle schema and lazy client
  lib/                 App infrastructure only: cn(), site constants, session, env, rate limits
test/                  Database and fixture helpers for the suite
drizzle/               Committed migrations
```

Rules:
- Path alias `@/*` → `./src/*`. Always use it.
- Server Components by default. Add `"use client"` only when needed, as deep in the tree as possible.
- `/` and `/cohort` are statically prerendered. Anything reading Postgres is `force-dynamic`.
- A `"use server"` file exports only async functions. Types, enums and constants its callers need go in `src/app/utils/`.
- A component belongs in its domain folder even with one consumer. `components/` folders hold `.tsx` that returns JSX; `.ts` helpers go in sibling `utils/`, SVGs in sibling `svg/`. Three.js scenes beside their 3D component are the existing exception.
- `src/lib/` never holds domain helpers.

## Coding Conventions

**TypeScript**
- No `any` and no non-null assertion `!`. Handle `null` and `undefined` explicitly.
- Prefer inferred types; annotate where it aids clarity, such as module boundaries.
- `interface` for object shapes, `type` for unions and aliases, `enum` for closed status or category sets. Domain interfaces use the `I` prefix.

**Components**
- Search `src/components/` before creating a component; extend or compose what exists. Compose shadcn primitives rather than rewriting them.
- Inline a small single-use subcomponent. Split it out when it is reused, has its own state, or is a distinct concept.
- A new reusable abstraction needs 3+ real usage sites or genuinely complex logic.
- Keep components under 200 lines. Shadcn primitives are exempt.
- Props interface is `<ComponentName>Props`, directly above the component.
- Presentational components do not fetch or hold business logic. Pass results down as props.

**Naming**
- Components: `PascalCase.tsx`, prefixed with their domain (`WaitlistForm`, `AdminStatusPill`). Avoid generic names.
- Hooks: `use-kebab-case.ts`, exporting `useCamelCase`. Services: `<noun>.service.ts` with static methods. Other files: `kebab-case.ts`.
- Descriptive variable names; abbreviate only what is universal (`id`, `url`).

**Exports**
- Route files use default exports because Next.js requires it. Every other file uses named exports.

**Comments**
- One-line `/** ... */` above exported components, interface props and named helpers (two lines at most). Describe purpose, not implementation. Skip self-explanatory throwaways.
- No dead code or commented-out blocks.

## UI and Design Rules

**Two design systems coexist. Check the route before reaching for a token, and never mix them on one route.**

| Route | System | Source |
|---|---|---|
| `/`, `/sample*` | WITHIN brand: Inter, ink on paper, square corners, one orange accent | [DESIGN.md](DESIGN.md) |
| `/cohort`, 404, `/admin` | Transparency Lab: Geist, `--wi-*` tokens | [docs/transparency-lab.md](docs/transparency-lab.md) |

**Components**
- Prefer shadcn/ui, checking [src/components/ui/](src/components/ui/) first. If a needed component is not installed, or does not exist in shadcn, stop and surface options rather than hand-rolling a substitute.
- `ui/` primitives carry brand styling and may be hand-edited. Re-adding one through the CLI overwrites that styling, so reapply it and diff before committing.
- No control or status without behaviour behind it.
- Use phosphor for icons and never emoji. Use `WithinLogo` or the files in `public/brand/` for the logo; never redraw it.

**Styling**
- Tailwind utilities only, using arbitrary values for anything off-scale. `style={}` is only for values that change at runtime. A design handed over in inline styles is not an exception. Generated image routes (`icon`, `apple-icon`, `opengraph-image`) are, because Satori cannot read Tailwind.
- Use `cn()` for conditional classes. Extract a component for a repeated pattern, never a CSS class.
- Never invent a color. Use existing tokens, and ask before adding or changing one. There is no dark mode.

**Motion**
- Animate with `motion/react` and the shared `EASE` curve. Keep it quick and precise with no visible bounce. Animate `transform` and `opacity`, honor reduced motion, and do not animate what a user triggers constantly.

**Accessibility**
- Visible focus on every interactive element. Semantic HTML, a label on every input, keyboard support for every interaction. Use `next/image`, `next/link`, `next/font`.

**Copy**
- English only, even for the Jakarta market. Short, factual statements: no em dashes, exclamation marks, hype words or emoji.
- Visitor-facing strings live in the route's copy file (`waitlist-copy.ts`, `sample-copy.ts`), never inline in components.
- The certifications are pending, so never present them as granted. Check product claims against [PRODUCT.md](PRODUCT.md) and flag any it does not support.

## Data, Services & Backend

**Layering**
- Read data in an async `page.tsx` or `layout.tsx` and pass plain data down. Mutations go through Server Actions; API routes exist only for webhooks, cron, and proxies a client must call.
- Actions orchestrate. Validation goes in `src/app/utils/`, network and database work in a service.
- Services touching a secret import `server-only` on their first line. Database services take the `SampleDatabase` type as a parameter so the same code runs on PGlite in tests.
- Schema changes go through `npm run db:generate`. Never hand-edit an applied migration.

**Trust boundaries**
- A Server Action is reachable by direct POST. Re-validate everything on the server, whatever the form already checked.
- Trust a webhook only after verifying it, and prefer re-fetching state from the source over believing a body.
- Every admin page and action calls `requireAdmin()`. The proxy only checks that a cookie exists.
- A public form or paid-API route stays listed in `initBotId({ protect })` in [instrumentation-client.ts](src/instrumentation-client.ts). `checkBotId()` fails for anything missing from it.
- Never send third-party error text to the browser. Real errors go to `console.error`; visitors get one generic message.
- Do not reveal who is registered unless the founder has accepted that trade-off. A duplicate waitlist email reports success.

**Money and orders**
- Every write must be safe to repeat, since webhooks arrive twice or out of order. Store the event first, never move a paid request backwards, and guard once-only emails with a column.
- Capacity changes happen in one transaction with the batch row locked.
- A third-party failure must not strand the customer or a slot. Payment, shipping and email wrappers log and return `null` or `false` rather than throw.
- Marketing consent is explicit and separate from order emails.

**Forms**
- Validate per field on the client with the same validator the server runs. Reuse the honeypot helper on public forms.

## Known Gotchas

- **Do not run `next build` while `next dev` is live.** They share `.next`, and the dev server then serves stale CSS. If classes silently fall back, or a route 404s and fonts vanish after files move, `rm -rf .next` and restart. Use `npx tsc --noEmit` to check types.
- **Swapping a `public/` image under the same name keeps the old derivative in dev.** Delete `.next/dev/cache/images`.
- **`tailwind-merge` drops an earlier `leading-*`** when an arbitrary `text-[size]` follows it in `cn()`. Put `leading-*` last.
- **`shadcn add` cannot answer its overwrite prompt without a terminal.** Set `button.tsx` and `dialog.tsx` aside first and restore them after. It has also imported `cn` from an npm package named `cn`; the right import is `@/lib/utils`.
- **Importing the `db` client without `DATABASE_URL` does not fail**, because it is a lazy proxy. The first query does.
- **`docs/superpowers/` and `docs/PRD/` are gitignored.** Specs there are local and may not exist on another machine.

## Testing

- Vitest runs in a node environment on `src/**/*.test.ts`, colocated with the code. Files run one at a time because PGlite flakes in parallel.
- Unit-test pure logic: validators, normalizers, error mappers, state rules. Test database services against PGlite with every migration applied ([test/sample-db.ts](test/sample-db.ts)).
- Do not write mock-heavy tests for actions or framework glue.
- Tests do not replace running the app. For UI changes, verify in the browser at phone and desktop widths.

## Safety Rules

Do NOT change without explicit instruction:
- Design tokens in [globals.css](src/app/globals.css), and the logo assets.
- Payment, webhook-verification and session code: `midtrans.service.ts`, `webhook-handlers.service.ts`, `admin-session.ts`, `src/proxy.ts`.
- A batch's id once it has requests. It lives on in box labels, Midtrans, Biteship and Shopify.
- `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `components.json`, `vercel.json`, `drizzle.config.ts`.
- `.env*`: never commit, never echo.

## Reference Docs

Read the one that matches the area before changing it, and update it in the same change when behaviour moves.

- [docs/environment.md](docs/environment.md): every env var, URL handling, Shopify app setup
- [docs/waitlist.md](docs/waitlist.md): the `/` page and its signup path
- [docs/sampling-program.md](docs/sampling-program.md): `/sample` and `/admin` routes, payment, shipping, check-ins, batches
- [docs/transparency-lab.md](docs/transparency-lab.md): tokens and UI rules for `/cohort`, the 404 and `/admin`
- [DESIGN.md](DESIGN.md): the WITHIN brand system
- [PRODUCT.md](PRODUCT.md): product facts and audience

## When in Doubt

Stop and ask. Surface tradeoffs, name what's confusing, and don't pick silently. When a needed component, token, abstraction, dependency, or env var doesn't exist, propose options before writing code.
