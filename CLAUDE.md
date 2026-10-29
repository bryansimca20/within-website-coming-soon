@AGENTS.md

# WITHIN — Coming Soon

## 1. Project Overview

Static "coming soon" landing page for **WITHIN**, an Indonesian sports-supplement brand
(BPOM and Halal certifications pending). Single-page marketing placeholder shown ahead of the
full storefront launch.

- **Two backends.** The waitlist on `/` writes signups into Shopify as customers through one
  Server Action and has no database. The **sampling program** (`/sample`, `/sample/r/[token]`,
  `/sample/feedback`, `/admin/*`) has its own Postgres, Midtrans payments, Biteship
  shipping, Resend emails and a founder admin (see Sampling program under Data Fetching &
  Services). Spec: `docs/superpowers/specs/2026-10-20-sampling-program-design.md` (local only).
- The route `/` is still statically prerendered. The sample and admin routes are dynamic.
- Deploys to **Vercel** (auto-detected, zero config).

The production storefront lives separately (`../within-website`, a Shopify Hydrogen app).
It shares branding, and — since email capture landed — the same Shopify store: signups here
become customers there, tagged `prelaunch`. The two repos have deliberately diverged on
design system: `/` here runs the WITHIN brand system from the waitlist design handoff (see
WITHIN Design System below), `/cohort` and the 404 still run Transparency Lab, and
`../within-website` ships the earlier Inter/monochrome system.

## 2. Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) at `http://localhost:3000` |
| `npm run build` | Production build (Turbopack) |
| `npm run start` | Serve the built app locally |
| `npm run lint` | Run ESLint (flat config, `eslint-config-next`) |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run db:generate` | Generate a Drizzle migration from `src/db/schema.ts` into `drizzle/` |
| `npm run db:migrate` | Apply migrations to `DATABASE_URL` |
| `npx shadcn@latest add <component>` | Add a shadcn/ui component |

Package manager is **npm** (`package-lock.json` is the source of truth). Do not introduce
`pnpm` / `yarn` lockfiles.

## 3. Environment

- **Node.js** `>= 20.9` (Next.js 16 requirement). Dev machine runs Node 22.
- Secrets live in `.env.local` (gitignored) locally and in Vercel project settings for
  Production + Preview. Adding a new key means mirroring it in this section and surfacing it
  to the user first (see When in Doubt).

| Key | Purpose |
| --- | --- |
| `SHOPIFY_STORE_DOMAIN` | `xxx.myshopify.com`. Which store signups are written to |
| `SHOPIFY_CLIENT_ID` | Dev Dashboard app Client ID, **`write_customers` scope only** |
| `SHOPIFY_CLIENT_SECRET` | `shpss_…` Client Secret. Exchanged for a 24h Admin API token at request time |

| `DATABASE_URL` | Neon Postgres for the sampling tables. Previews get their own Neon branch |
| `SESSION_SECRET` | iron-session secret for the founder admin cookie, 32+ chars |
| `ADMIN_PASSCODE` | Shared founder passcode for `/admin/login` |
| `MIDTRANS_SERVER_KEY` | Snap transactions and notification signature checks |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Public by design: snap.js `data-client-key` |
| `NEXT_PUBLIC_MIDTRANS_ENV` | `sandbox` or `production`; picks both Midtrans hosts |
| `BITESHIP_API_KEY` | Area search, rates, orders |
| `BITESHIP_WEBHOOK_TOKEN` | Secret `?token=` on the Biteship webhook URL (Biteship signs nothing) |
| `SAMPLE_ORIGIN_CONTACT_NAME`, `_PHONE`, `_ADDRESS`, `_AREA_ID`, `_POSTAL_CODE`, `_NOTE` | The BSD office as Biteship origin (all prefixed `SAMPLE_ORIGIN_`) |
| `RESEND_API_KEY`, `SAMPLE_EMAIL_FROM`, `SAMPLE_EMAIL_REPLY_TO` | Sampler emails through Resend |
| `CRON_SECRET` | Vercel Cron sends it as `Authorization: Bearer …`; `/api/cron/feedback-reminders` refuses anything else |

- Every URL the sampling program emits (emails, the Snap finish callback, the card's QR target
  `/sample/feedback`) is built from `SITE_URL` (`NEXT_PUBLIC_SITE_URL`). Set it per environment.
- Shopify killed in-admin custom apps + static `shpat_` tokens. The app now lives in the
  **Dev Dashboard** (`dev.shopify.com/dashboard`): scope `write_customers`, Release the version,
  Install on the store. The service exchanges Client ID + Secret for a short-lived token via
  `POST /admin/oauth/access_token` (`grant_type=client_credentials`) on each write — no static
  token to store or rotate.
- **Never** prefix any of these with `NEXT_PUBLIC_`, and never import
  [shopify-customer.service.ts](src/services/shopify-customer.service.ts) from a client
  component. It imports `server-only`, so doing so is a build error rather than a leaked secret.
- The Admin API version is a code constant in that service, not an environment variable.
- Shopify also needs a customer metafield definition (`custom.instagram_handle`, single line
  text). Without it the value still writes but stays invisible in the admin UI.

## 4. Tech Stack

- **Next.js 16.2.10** — App Router, Turbopack is the default bundler for both `dev` and `build`.
  ⚠️ This major has breaking changes vs. older Next.js; read `@AGENTS.md` and the bundled
  guides in `node_modules/next/dist/docs/` before writing framework code — do not rely on
  training-data conventions.
- **React 19.2.4** / `react-dom` 19.2.4.
- **TypeScript 5**, strict mode.
- **Tailwind CSS v4** — CSS-first config. No `tailwind.config.*`; theme tokens are CSS
  variables inside `@theme` in [src/app/globals.css](src/app/globals.css).
- **shadcn/ui** — style `base-nova`, base color `neutral`, RSC enabled. Built on
  **Base UI** (`@base-ui/react`), not Radix. Primitives live in
  [src/components/ui/](src/components/ui/).
- **`@phosphor-icons/react/ssr`** — icons (`Nav`, `Footer`, `Compare`, `Faq`). `lucide-react`
  is used only inside the shadcn primitives (`select`, `sheet`, `sidebar`); app code uses phosphor.
- **`@vercel/analytics`** — `<Analytics />` in the root layout records page views; waitlist
  interactions go through `trackWaitlistEvent()` in
  [waitlist-analytics.ts](src/components/waitlist/utils/waitlist-analytics.ts). Nothing is sent
  in local dev. Web Analytics must be enabled on the Vercel project.
- Utilities: `tw-animate-css`, `class-variance-authority`, `clsx`, `tailwind-merge`
  (composed by `cn()` in [src/lib/utils.ts](src/lib/utils.ts)).
- **`botid`** — Vercel bot protection for the signup Server Action. `next.config.ts` is wrapped
  in `withBotId()`, protected paths are declared in
  [src/instrumentation-client.ts](src/instrumentation-client.ts), and the server calls
  `checkBotId()`. A path missing from `initBotId({ protect })` makes `checkBotId()` fail, so the
  two must stay in sync. Locally `checkBotId()` always returns `isBot: false`.
- **`server-only`** — import guard on modules that hold secrets.
- **Drizzle ORM** + **postgres** — sampling schema in [src/db/schema.ts](src/db/schema.ts), committed
  migrations in `drizzle/` (the second one seeds Batch 01). [client.ts](src/db/client.ts) is a lazy
  proxy, so importing it without `DATABASE_URL` does not connect. Services take the
  `SampleDatabase` type so the same code runs on PGlite in tests.
- **`zod`** — the two sampling form validators. The three-field waitlist validator stays hand-written.
- **`iron-session`** — the founder admin cookie (`within_admin`). [src/proxy.ts](src/proxy.ts) only
  checks the cookie is present; `requireAdmin()` verifies it on every admin page and action.
- **Vitest** (dev) — unit tests for pure logic, colocated as `*.test.ts`. `server-only` is
  aliased to a stub in [vitest.config.ts](vitest.config.ts) so services stay testable.
  Database services are tested against **`@electric-sql/pglite`** with every migration applied
  ([test/sample-db.ts](test/sample-db.ts)); files run one at a time (`fileParallelism: false`).

## 5. Architecture

App Router project under [src/](src/) with the `@/*` → `./src/*` path alias.

```
src/
├── instrumentation-client.ts  # BotID protected-path declaration (runs on the client)
├── app/              # Routes. layout.tsx + page.tsx are the only entry points.
│   ├── layout.tsx    # Root layout (fonts, <html>/<body>, globals import)
│   ├── page.tsx      # "/" — the waitlist page ("feature orbit", comp 2c of the handoff)
│   ├── cohort/       # "/cohort" — unlisted founding-member preview (Transparency Lab)
│   ├── fonts/        # BiroScriptPlus.otf, loaded with next/font/local
│   ├── not-found.tsx # 404, on-brand
│   ├── globals.css   # Tailwind v4 import + @theme tokens + :root design tokens
│   ├── icon.tsx, apple-icon.tsx, opengraph-image.tsx  # generated icon/OG routes (no static favicon.ico)
│   ├── robots.ts, sitemap.ts  # generated SEO routes
│   ├── actions/      # Server Actions ("use server"), one file per action
│   └── utils/        # Route-local pure helpers (validation, honeypot, action state)
├── components/
│   ├── brand/        # WithinLogo — the brand mark, used site-wide
│   ├── waitlist/     # The waitlist page: WaitlistPage + orbit, feature cards, sheet, form, joined dialog
│   │   ├── svg/      # WaitlistGlyphs.tsx — the page's hand-drawn icons
│   │   └── utils/    # waitlist-copy.ts (every string, layouts, features), waitlist-analytics.ts
│   ├── cohort/       # "/cohort" sections
│   ├── coming-soon/  # Reveal / Section / MotionProvider only, kept for "/cohort"
│   └── ui/           # shadcn/ui primitives — WITHIN-restyled, owned in-repo (see UI and Design Rules)
├── services/
│   └── shopify-customer.service.ts   # Shopify Admin API writes
└── lib/
    ├── utils.ts      # cn() and other app infrastructure
    └── site.ts       # SITE_NAME / SITE_URL / SITE_DESCRIPTION / Instagram constants
```

- **Server Components by default** (RSC). Client interactivity is opt-in via `"use client"`,
  pushed as deep into the tree as possible.
- **`/` and `/cohort` are statically prerendered.** The sample and admin routes are
  `force-dynamic`, since they read Postgres on every request.
  The handoff's alternate "button first" layout (comp 2f) was built and
  then dropped on 2026-10-09 in favour of 2c on both phone and desktop.
- A `"use server"` file may export **only async functions**. Types, enums and constants that
  the action's callers need live in `src/app/utils/` (e.g. `subscribe-state.ts`), never in the
  action file itself.

---

## Rules

- Path alias `@/*` → `./src/*`. Always use it.
- `page.tsx` and `layout.tsx` are async server components (the `page.tsx` data-fetch pattern lives in Data Fetching & Services). Add `"use client"` only when needed; push it as deep into the tree as possible.
- Co-locate route-specific code; promote to `src/components/` (components) or `src/utils/` (helpers) only when reused across 2+ routes. `src/lib/` is framework / app infrastructure only — never domain helpers.
- `components/` folders contain only `.tsx` files that return JSX — no `.ts` helpers. Route-local `.ts` helpers go in sibling `utils/`. SVG primitives go in sibling `svg/`.

## Coding Conventions

**TypeScript**
- Strict mode on. Do not use `any` even though the lint rule is disabled. Never use the non-null assertion `!` — handle `null` / `undefined` explicitly (early return, type guard, default).
- Prefer inferred types. Add explicit annotations only when they aid clarity (module-boundary signatures, ambiguous return types).
- `interface` for object shapes (props, domain entities); `type` for unions, intersections, and primitive aliases (e.g., `type EngineStatus = "ok" | "warn" | …`).
- Use `enum` for closed status/category sets.
- Domain interfaces use the `I` prefix (`IShip`, `ITelemetry`). No exceptions.

**Component patterns**
- Before creating a new component, search [src/components/](src/components/) and the current route — if something similar exists, extend or compose it rather than building a near-duplicate.
- Functional components only. Compose shadcn primitives — wrap, don't rewrite.
- Default to co-location (inline a ≲ 50-line, single-use subcomponent as a local function); split into a new file when reused across 2+ parents, 75+ lines, has internal state, is a distinct concept (SVG primitive, section wrapper), or is a top-level route component (`*PageContent`, `*Sidebar`).
- Creating a new reusable abstraction (generic component, hook, or util) requires 3+ concrete usage sites or genuinely complex logic. Three similar lines beat a premature abstraction (parent CLAUDE.md §2).
- Keep components under 200 lines. If a parent exceeds it, extract sub-components or hooks.
- Props interface is named `<ComponentName>Props` and defined directly above the component.
- Presentational components do not fetch data or contain business logic. Transforms live in `utils/` or `services/`; pass results down as props. (Where fetching itself lives → Data Fetching & Services.)

**Naming**
- Components: `PascalCase.tsx`, prefixed with their domain (`SidebarOrgCard`, `EngineCard`). Avoid generic names like `Chip`, `Row`, `Card`.
- Hooks: filename `use-kebab-case.ts`, export `useCamelCase`.
- Services: `<noun>.service.ts` with static methods. Other utilities: `kebab-case.ts`.

**Exports**
- Route files (`page.tsx`, `layout.tsx`) use default exports — Next.js requires it.
- Every other file uses **named exports**. No exceptions.

**Comments**
- One-line `/** ... */` above every exported component, every interface prop, and every named helper (two lines max). Describe purpose, not implementation — don't restate the type signature or write `@param`/`@returns`.
- Skip only self-explanatory throwaways (e.g., `className?: string`) and inline arrow callbacks.

**Style**
- Descriptive variable names. Avoid abbreviations unless universally understood (`id`, `url`, `idx`).
- No dead code or commented-out blocks in committed files — git remembers.

## UI and Design Rules

**Components**
- Always prefer shadcn/ui over custom implementations. Check [src/components/ui/](src/components/ui/) first.
- **`ui/` primitives are WITHIN-restyled and owned in-repo** — they may be hand-edited to carry brand styling (e.g. [button.tsx](src/components/ui/button.tsx) is rebranded uppercase/sharp/monochrome). Re-running `npx shadcn@latest add <component>` **overwrites** the file with the vanilla version; after any CLI re-add, reapply the WITHIN restyle and diff before committing.
- [dialog.tsx](src/components/ui/dialog.tsx) is a hand-owned Base UI wrapper under the same ownership model as `button.tsx`. It carries behaviour only (focus trap, Escape, focus return, fade); each caller positions the popup and sets its surface. The waitlist's phone bottom sheet is this same Dialog pinned to the bottom edge, so there is no separate drawer.
- If a needed shadcn component is **not installed**, stop and tell the user — let them install (`npx shadcn@latest add <component>`) or take a different approach. Do not hand-roll a substitute.
- If a component does **not exist in shadcn at all**, surface options before writing code.
- Icons: the shipped page actually uses `@phosphor-icons/react/ssr` (`Nav`, `Footer`,
  `Compare`, `Faq`). `lucide-react` appears only inside the shadcn primitives (`select`, `sheet`, `sidebar`) —
  don't use it in app code; phosphor is the icon set. **Data viz:** Recharts (wrapped with
  shadcn `<ChartContainer>`) · Mapbox via `react-map-gl`. (Neither is installed yet — install
  when first needed.)

**Styling**
- **Tailwind utilities only — never `style={}` for a static value.** This holds even when porting a design authored in inline styles: translate every static value to a Tailwind class, using arbitrary values for anything off-scale (`text-[17px]`, `tracking-[0.14em]`, `max-w-[420px]`, `min-h-[calc(100vh-66px)]`, `bg-linear-to-b from-black/[0.38] via-black/[0.30] to-black/[0.72]`). `style={}` is allowed ONLY for values that change at runtime — driven by state, refs, or render-computed props (an animated width from state, a `transform` toggled open/closed). If the value is fixed at author time, it is a Tailwind class, not a style. "The design came in inline styles" is not an exception. (Next `opengraph-image`/`icon`/`apple-icon` ImageResponse files are the one exemption — Satori renders inline styles only, never Tailwind.)
- Use `cn()` from [src/lib/utils.ts](src/lib/utils.ts) for conditional classes.
- Extract a component for repeated multi-class patterns — never extract a CSS class. Do not extract a CSS class for styling either; component or utilities only.

## WITHIN Design System

**Two systems coexist. Check which route you are in before reaching for a token.**

- **`/` (the waitlist page) runs the WITHIN brand system** from the design
  handoff (`../within-waitlist-handoff`, tokens in its `assets/within-tokens.json`). In
  `globals.css` that is `brand-ink` `#191919`, `brand-mist` `#f2f2f2`, `brand-muted` `#6b6b6b`,
  `brand-muted-dark` `#8c8c8c`, and `flavor-orange` `#ff8326` as the only accent (text on it is
  ink). Errors (messages and the 2px error underline) use `brand-error` `#d0312d`, a status
  colour rather than an accent. Type is Inter (`font-brand`), headlines Regular, emphasis by weight and never colour;
  Biro Script (`font-script`) is for the "see you soon" accent only, letters only. Corners are
  square, there are no shadows, and the dotted circle is the only round element. The page is one
  viewport with no scroll (`h-dvh overflow-hidden`); the phone and desktop comps switch at the
  `desk:` breakpoint (900px). The floating sachet is a CSS keyframe (`animate-sachet-float`),
  off under reduced motion; it is the design's one sanctioned loop. Icons are the hand-drawn
  SVGs in `components/waitlist/svg/`. Every string lives in `waitlist-copy.ts`.
- **`/cohort` and the 404 still run Transparency Lab**, described in the rest of this section.
  The paragraphs below that name `Hero`, `Nav`, `Footer`, `Compare`, `Faq`, `Ledger`, `Close`,
  `WaitlistOverlay`, `SignupForm`, `drawer.tsx` or `coming-soon/ui/button.tsx` describe
  components the waitlist remake deleted; read them as history.

The durable brand guardrail: **Transparency Lab**, promoted to `/` from the exploratory `/v2`
route earlier in this refactor. Source of truth: Claude Design project
`9a760727-dad3-4223-afd7-78934815824f` ("Within Design System"). Tokens live in
[globals.css](src/app/globals.css) (`@theme` + `:root`); brand components in
[src/components/brand/](src/components/brand/); page sections and motion primitives in
[src/components/coming-soon/](src/components/coming-soon/).

**Color — paper-white clinical canvas, cool-tinted greys, one true-black signal.** The ink
scale runs `--wi-black` `#0b0d12` → `--wi-charcoal` `#1a1e26` → `--wi-ink-700` `#363d49` →
`--wi-ink-500` `#626b7a` → `--wi-ink-300` `#9aa3b2`, against `--wi-line` `#e2e7ee`,
`--wi-mist` `#eceff4`, `--wi-paper-dim` `#f6f8fb` and `--wi-paper` `#ffffff`. `--wi-signal`
(`#000000`, stepped by `--wi-signal-bright` `#262c36` and the `--wi-signal-tint` `#e3e7ef`
wash) is the one token that marks actives and live data — resting states step down to ink
rather than compete with it. `--wi-flag` (`#ce1126`) is reserved for the Indonesian flag, not
a general accent. Status colors stay as the intentional non-monochrome exceptions:
`--wi-error` `#e5484d`, `--wi-success` `#30a46c`. Use `--wi-*` tokens / `wi-*` utilities or the
shadcn semantic tokens (`bg-primary`, `text-muted-foreground`, …); **never invent a color,
never use `oklch`, never a `dark:` variant** (`viewport.colorScheme` in `layout.tsx` is
`"light"` only).

**Type — Geist Sans for display and body, Geist Mono for readouts.** Inter is gone from the
repo. Both fonts come from the `geist` package (`GeistSans` / `GeistMono` in
[layout.tsx](src/app/layout.tsx)); `:root` sets Geist Sans as the base `font-family`. Readouts
(numerals, status strings) use the `.wi-readout` utility class — tabular numerals, tight
tracking — not a dedicated component. Type scale exposed via `@theme`: `text-display-2xl`
(96px), `text-display-xl` (72px), `text-display-lg` (56px), `text-display-md` (40px),
`text-h1` (34px), `text-h2` (26px), `text-h3` (20px), `text-body-lg` (18px), `text-body`
(16px), `text-2xs` (11px). There is no hero/label component register: hero and label type is
hand-set per component (see `Hero.tsx`'s `<motion.h1>`, `WaitlistOverlay.tsx`'s
`OVERLAY_TITLE`). Several steps of that scale currently have no consumer, which is expected
for a declared ramp, not a signal to delete them.

**Voice — honest, introverted, high-performing.** Short declarative statements. Subtractive
framing ("No additives. Just what works."). Facts over adjectives ("1000mg sodium" beats
"packed with electrolytes"). Second person, sparingly. Prices in Rupiah (`Rp 45.000`, dot
thousands). **No emoji, no exclamation marks, no hype words** ("revolutionary", "game-changing").

**Form.** Crisp, near-flush corners, applied as direct CSS-variable arbitrary values — no
component reaches for the Tailwind `rounded-sm` / `rounded-lg` scale:
`rounded-[var(--wi-radius-control)]` (`--wi-radius-control` = `2px`) on controls,
`rounded-[var(--wi-radius-card)]` (`--wi-radius-card` = `3px`) on cards, dialogs and the
drawer. `--wi-radius-card` happens to equal the shadcn `--radius` bridge (also `3px`), but
nothing relies on that coincidence — every card/dialog pulls `--wi-radius-card` directly.
Cool-tinted shadows only, never a colored halo: `--wi-shadow-sm` / `-md` / `-lg` (all
`rgba(11, 13, 18, …)`), plus a `--wi-shadow-focus` ring — in practice only `--wi-shadow-lg` has
a current callsite (`dialog.tsx`, `drawer.tsx`); `-sm`, `-md` and `-focus` are declared but
unused today. Full-bleed black surfaces do appear — `Close`'s waitlist section sets
`bg-wi-black` directly on its `<section>`, and `WaitlistOverlay`'s Dialog/Drawer popup does
the same — but **not** through `Section`: `Section`'s `SURFACE` object defines `black` as one
of three page-surface options (`paper` / `paperDim` / `black`), yet every current callsite
(`Compare.tsx` → `surface="paperDim"`, `Faq.tsx` → `surface="paper"`) passes `paper` or
`paperDim`; nothing currently passes `surface="black"`. `Hero` does not import `Section` and
is not a black panel — its only `bg-wi-black` is a 20%-opacity blurred glow behind the product
photo, and its actual page background is `bg-wi-paper`. For a reference full-bleed black
section, look at `Close.tsx`, not `Hero.tsx`.

**Motion.** Animate with **Motion** (`motion/react`, the `motion` package) — not hand-rolled CSS
keyframes or `IntersectionObserver`. Quick, precise, **no visible bounce** (WITHIN is introverted);
fades and short slides only, no infinite decorative loops.
- The real primitives live in
  [src/components/coming-soon/Reveal.tsx](src/components/coming-soon/Reveal.tsx): `Reveal`
  (fade + lift into view once, on scroll) and the exported `EASE` curve
  `[0.23, 1, 0.32, 1]` — this **matches** `--wi-ease-out` / `--ease-out` in `globals.css`
  (`cubic-bezier(0.23, 1, 0.32, 1)`; the old system used a different curve). `EASE` is used
  throughout `Hero`, `WhyWithin`, `Ledger`, `Faq`, `Compare`, `CountUp`,
  `DissectionWatermark`, `WaitlistOverlay` and `SignupForm` — use it for every tween.
  `Reveal.tsx` exports exactly two things: `Reveal` and `EASE`. Stagger a group by giving
  sibling `Reveal`s increasing `delay` values (30-80ms apart).
- Wrap animated trees in [MotionProvider](src/components/coming-soon/MotionProvider.tsx)
  (`<MotionConfig reducedMotion="user">`), mounted once around the whole tree in `page.tsx`,
  so motion honors `prefers-reduced-motion` (drops movement, keeps fades).
- Only animate `transform` and `opacity` (GPU); avoid animating layout props except the
  deliberate exception (`Faq`'s accordion `height`, via `AnimatePresence`).
- Durations in practice: `0.22s`–`0.45s` for micro-interactions and overlay content, `~0.5s`–`1s`
  for scroll reveals. Springs are allowed only with `bounce` ≈ 0. Don't animate anything a user
  triggers dozens of times a day.

**Buttons.** [src/components/ui/button.tsx](src/components/ui/button.tsx) (the shared shadcn
primitive) and
[src/components/coming-soon/ui/button.tsx](src/components/coming-soon/ui/button.tsx) (a
second, page-local `Button`) are deliberately separate files, not one component reused two
ways — don't assume editing one updates the other. They currently differ in weight, tracking,
easing and focus ring: `components/ui/button.tsx` is `font-bold`, `tracking-[0.14em]`, eases
on `cubic-bezier(0.2,0,0,1)` at `120ms`, rings `black/15`; `coming-soon/ui/button.tsx` is
`font-semibold`, `tracking-[0.1em]`, eases on the canonical `--wi-ease-out` curve at `130ms`,
rings `wi-signal/40`.

**Icons.** The shipped page uses `@phosphor-icons/react/ssr` (`Nav`, `Footer`, `Compare`,
`Faq`) — `lucide-react` appears only inside the shadcn primitives (`select`, `sheet`, `sidebar`). **Never
emoji.** The logomark is a brand mark, not an icon.

**Logo.** Always use `WithinLogo` (or the PNGs in `public/brand/`). **Never redraw, trace, or
approximate the mark.**

**Brand components.** `WithinLogo` is the only one. `WiHero` and `WiEyebrow` were deleted on
2026-08-13 once the 404 page moved onto the Transparency Lab type system and left them with no
consumers. Do not reintroduce a shared "hero voice" component without a reason: hero and label
type is hand-set per component in this design system.

## Data Fetching & Services

The waitlist on `/` reads no server-side data and writes in one place: pre-launch email capture.
The sampling program is the other backend; it has its own section below.

**The signup path**

`WaitlistForm` mounts inside `WaitlistSheet` (a bottom sheet on phones, a centred modal on
desktop), opened by the one orange button on the page.

```
WaitlistForm ("use client", mounted inside WaitlistSheet)
  ├─ validateField() per field               → each error shown under its own field
  └─ subscribeAction(formData) ("use server", called inside useTransition)
       ├─ checkBotId()                       → isBot ? generic error
       ├─ isHoneypotTripped()                → tripped ? report success, write nothing
       ├─ parseSubscriberInput()             → same validator, re-run server-side
       └─ ShopifyCustomerService.createPrelaunchSubscriber()
            └─ Admin GraphQL customerCreate  → customer tagged `prelaunch`, SUBSCRIBED
```

Fields run email, name, Instagram, and all three are required since 2026-10-20
(`SUBSCRIBER_FIELD_ORDER` and `validateField` in `subscriber-input.ts` drive both the form and
the server check). Each field shows its own error under itself, checked on blur and on submit. The form calls the action directly rather
than through `useActionState`, because the sheet keeps the typed values for "Edit my details".
On success the sheet closes and `WaitlistJoinedDialog` opens in its place: a centred popup on
every screen size that thanks the visitor by first name, signed WITHIN / Jakarta, with the
Instagram follow as the next step. The orange button stamps to ink with a check (`data-joined`)
and reopens that popup from then on. "Edit my details" re-opens the form; a second submit with
the same email is a duplicate, which reports success and changes nothing in Shopify.
`/` must stay listed in `initBotId({ protect })`.

**Rules this path establishes**

- Server Actions live in `src/app/actions/` as `<verb>.action.ts` and hold orchestration only.
  Validation goes in `src/app/utils/`, the network call in a service.
- Services are `<noun>.service.ts` with static methods, and any service touching a secret
  imports `server-only` on its first line.
- Pure logic (validators, normalizers, error mappers) is unit-tested. Network and framework
  glue is not — do not add mock-heavy tests for the action itself.
- A Server Action is reachable by direct POST, not only through the UI. Re-validate everything
  server-side regardless of what the form already checked.
- Never surface a Shopify error message to the browser. A duplicate email reports **success**
  (saying otherwise leaks who is registered); everything else reports one generic message.
  Real errors go to `console.error` only.

## Sampling program

Samples go out in numbered batches (Batch 01 was 100 boxes of three sachets, free, the sampler pays
the courier). Spec and plan are in
`docs/superpowers/` (gitignored, local).

```
/sample (dynamic)                       SampleRequestForm, 3 steps, client-held values
  ├─ GET  /api/sample/areas?q=          Biteship area search (rate-limited proxy)
  ├─ POST /api/sample/rates             live courier quotes, cheapest 4
  └─ requestSampleAction                BotID + honeypot + zod, then:
       ├─ SampleRequestService.claim    one transaction, batch row locked: lapsed holds expire,
       │                                same-email unpaid hold replaced, paid duplicate refused,
       │                                capacity checked, next box number taken
       ├─ SamplePaymentService.createAttempt   Midtrans Snap, expiry = minutes left in the hold
       └─ Shopify customerCreate        tags prelaunch, coming-soon, sampling-<batch id>, ref-<slug>;
                                        SUBSCRIBED only if they ticked the optional launch email
/sample/r/[token]                       status page; "Pay now" = reopenPaymentAction
POST /api/webhooks/midtrans             signature checked, attempt updated, paid email once
admin "Book selected"                   SampleShipmentService.bookRun, one Biteship order each
POST /api/webhooks/biteship?token=      order re-fetched from Biteship, shipped/delivered email once
/sample/feedback[?code=]                QR landing; matched by token, else by email
/admin/requests, /admin/requests/[id]   selected batch: counts, search, ship runs, request detail, resends
/admin/export (+ /registrations, /feedback)  the selected batch's two CSVs
/admin/batches                          every batch: New batch, capacity, Coming soon / Open / Closed
/admin/sample*                          old links, redirect to the routes above
```

**Rules this path establishes**

- A request's 24-hour hold is ours; a Midtrans attempt lapsing (QRIS defaults to 15 minutes)
  ends only that attempt. `pending_payment` becomes `expired` lazily, whenever the count or a
  status page is read. The only cron is the check-in reminder (below).
- Webhook bodies are stored in `sample_webhook_events` before processing and every webhook is
  answered 200 once stored. Midtrans is trusted only after its SHA512 signature; Biteship
  bodies are never trusted, the order is re-fetched. A paid request is never moved backwards,
  and each once-only email has a guard column (`paid_at`, `shipped_email_sent_at`,
  `delivered_email_sent_at`).
- `MidtransService.createSnapTransaction`, `BiteshipService.createOrder` and
  `EmailService.send` never throw; they log and return null or false. A thrown error there
  once left unpaid holds occupying slots.
- The check-in has two doors. The personal link (`?code=`, in the delivered and reminder emails and on
  the status page) identifies the sampler outright. The card's QR asks for the email first: it must
  belong to a shipped or delivered order with no check-in yet, or the form says why it can't go on.
  That does reveal whether an email claimed samples; the founder accepted it on 2026-10-22. Older
  unmatched rows are still listed in admin.
- One check-in reminder goes out 7 days after delivery, from the daily Vercel Cron in `vercel.json`
  (`/api/cron/feedback-reminders`, 02:00 UTC = 09:00 WIB). `feedback_reminder_sent_at` guards it.
- Closed answer sets are stored as option keys from `src/app/utils/sample-options.ts`; labels
  live in `src/components/sample/utils/sample-copy.ts`; email copy in
  `src/services/sample-email-copy.ts`.
- `/sample*` runs the WITHIN brand system from `/` (and scrolls). `/admin` runs Transparency
  Lab tokens and `components/ui/button.tsx`. Both are `noindex` and out of the sitemap.
- The launch-email box on step 1 is optional and unticked ("Email me when WITHIN launches.").
  Ticking it is the only marketing consent a sampler gives: it sets
  `consented_at` and subscribes them in Shopify. Order emails (paid, shipped, delivered, reminder,
  thanks) go to every sampler regardless.
- `/sample` and `/sample/feedback` must stay listed in `initBotId({ protect })`.

**Batches** (`SampleBatchService`, design `docs/superpowers/specs/2026-10-28-sample-batches-and-admin-design.md`)

- Batches are always numbered: the next is `Batch NN` / `bNN` (`Batch 100` / `b100` after 99). A founder only
  chooses capacity (1 to 10 000). The id is permanent: it is in box labels (`B02-042`), Midtrans order ids,
  Biteship references and the Shopify tag `sampling-b02`.
- Each batch has a phase. At most one is `open`, enforced in `setPhase` ("Close Batch 01 first.") and by the
  partial unique index `sample_batches_one_open`. A new batch starts `upcoming`.
- `/sample` serves the open batch (its form, or its claimed notice once full); with none open, the newest
  `upcoming` batch's coming-soon page; otherwise the newest batch's claimed notice. Every visitor line that
  names the batch or its size comes from `batchCopy()` in `sample-copy.ts`; never hard-code "Batch 01" or "100".
- One email, one sample: an email with a paid, shipped or delivered request in any batch is refused
  (`already-requested`, and the paid email for that request is resent naming its own batch). A live unpaid
  hold in any batch is expired by a new claim.
- Admin's selected batch lives in the `within_admin_batch` cookie (path `/admin`); a missing or unknown value
  falls back to the open batch, else the newest. Exports are one batch per file:
  `within-<id>-registrations.csv` and `within-<id>-feedback.csv`.
- Admin runs shadcn's sidebar, table, select, input, label, badge, separator, sheet, skeleton and tooltip,
  restyled to `wi-*` tokens and `--wi-radius-*`; the `--sidebar*` tokens in `globals.css` map onto `wi-*`.
  `button.tsx` and `dialog.tsx` stay hand-owned. `shadcn add` cannot answer its overwrite prompt without a
  terminal: set those two files aside before adding components, and restore them after. It has also been seen
  importing `cn` from an npm package called `cn`; the right import is `@/lib/utils`.

When server-side **reads** first become necessary: fetch inside the relevant async `page.tsx` /
`layout.tsx` Server Component, then pass plain data down as props. Presentational components
never fetch.

## When in Doubt

Stop and ask. Parent CLAUDE.md §1 applies: surface tradeoffs, name what's confusing, don't pick silently. When a needed component, token, abstraction, dependency, or env var doesn't exist, propose options before writing code.
