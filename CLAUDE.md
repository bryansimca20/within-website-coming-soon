@AGENTS.md

# WITHIN — Coming Soon

## 1. Project Overview

Static "coming soon" landing page for **WITHIN**, an Indonesian sports-supplement brand
(BPOM / Halal certified). Single-page marketing placeholder shown ahead of the full
storefront launch.

- **No backend.** No API routes, no database, no auth, no server actions, no form persistence.
- Everything is statically prerendered and served as a plain static site.
- Deploys to **Vercel** (auto-detected, zero config).

The production storefront lives separately (`../within-website`, a Shopify Hydrogen app);
this repo is unrelated to it beyond shared branding.

## 2. Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) at `http://localhost:3000` |
| `npm run build` | Production build (Turbopack) |
| `npm run start` | Serve the built app locally |
| `npm run lint` | Run ESLint (flat config, `eslint-config-next`) |
| `npx shadcn@latest add <component>` | Add a shadcn/ui component |

Package manager is **npm** (`package-lock.json` is the source of truth). Do not introduce
`pnpm` / `yarn` lockfiles.

## 3. Environment

- **Node.js** `>= 20.9` (Next.js 16 requirement). Dev machine runs Node 22.
- **No environment variables.** There is no `.env`; the site has no runtime config or secrets.
  If one becomes necessary, add it to `.env.local`, mirror the key in this section, and
  surface it to the user first (see When in Doubt).

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
- **lucide-react** — icons.
- Utilities: `tw-animate-css`, `class-variance-authority`, `clsx`, `tailwind-merge`
  (composed by `cn()` in [src/lib/utils.ts](src/lib/utils.ts)).

## 5. Architecture

App Router project under [src/](src/) with the `@/*` → `./src/*` path alias.

```
src/
├── app/              # Routes. layout.tsx + page.tsx are the only entry points.
│   ├── layout.tsx    # Root layout (fonts, <html>/<body>, globals import)
│   ├── page.tsx      # "/" — the coming-soon page
│   ├── globals.css   # Tailwind v4 import + @theme tokens (shadcn colors)
│   └── favicon.ico
├── components/
│   └── ui/           # shadcn/ui primitives — WITHIN-restyled, owned in-repo (see UI and Design Rules)
└── lib/
    └── utils.ts      # cn() and other app infrastructure
```

- **Server Components by default** (RSC). Client interactivity is opt-in via `"use client"`,
  pushed as deep into the tree as possible.
- **Single static route** (`/`). Everything prerenders to static content at build time.
- Folders `src/utils/`, `src/hooks/`, `src/services/` do not exist yet; create them per the
  Rules below when the code that belongs in them appears.

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
- If a needed shadcn component is **not installed**, stop and tell the user — let them install (`npx shadcn@latest add <component>`) or take a different approach. Do not hand-roll a substitute.
- If a component does **not exist in shadcn at all**, surface options before writing code.
- Icons: `lucide-react` only. **Data viz:** Recharts (wrapped with shadcn `<ChartContainer>`) · Mapbox via `react-map-gl`. (Neither is installed yet — install when first needed.)

**Styling**
- **Tailwind utilities only — never `style={}` for a static value.** This holds even when porting a design authored in inline styles: translate every static value to a Tailwind class, using arbitrary values for anything off-scale (`text-[17px]`, `tracking-[0.14em]`, `max-w-[420px]`, `min-h-[calc(100vh-66px)]`, `bg-linear-to-b from-black/[0.38] via-black/[0.30] to-black/[0.72]`). `style={}` is allowed ONLY for values that change at runtime — driven by state, refs, or render-computed props (an animated width from state, a `transform` toggled open/closed). If the value is fixed at author time, it is a Tailwind class, not a style. "The design came in inline styles" is not an exception. (Next `opengraph-image`/`icon`/`apple-icon` ImageResponse files are the one exemption — Satori renders inline styles only, never Tailwind.)
- Use `cn()` from [src/lib/utils.ts](src/lib/utils.ts) for conditional classes.
- Extract a component for repeated multi-class patterns — never extract a CSS class. Do not extract a CSS class for styling either; component or utilities only.

## WITHIN Design System

The durable brand guardrail. Source of truth: Claude Design project
`9a760727-dad3-4223-afd7-78934815824f` ("Within Design System"). Tokens live in
[globals.css](src/app/globals.css); brand components in [src/components/brand/](src/components/brand/).

**Color — monochrome, no hue anywhere.** The whole palette is `#000000` black · `#191919`
charcoal · `#f2f2f2` off-white · `#ffffff` white (+ documented ink/line/mist greys). Hierarchy
comes from weight, fill and contrast — never chroma. Status (success/error) is expressed
monochromatically. Use `--wi-*` tokens / `wi-*` utilities or the shadcn semantic tokens
(`bg-primary`, `text-muted-foreground`, …); **never invent a color, never use `oklch`, never a `dark:` variant.**

**Type — Inter only, no italics anywhere** (upright at every weight). Two registers:
hero/label = Bold 700, UPPERCASE, tight tracking (use `WiHero` / `WiEyebrow`); text = 400/500,
leading 1.5. Type scale exposed as `text-display-2xl…text-2xs`.

**Voice — honest, introverted, high-performing.** Short declarative statements. Subtractive
framing ("No additives. Just what works."). Facts over adjectives ("1000mg sodium" beats
"packed with electrolytes"). Second person, sparingly. Prices in Rupiah (`Rp 45.000`, dot
thousands). **No emoji, no exclamation marks, no hype words** ("revolutionary", "game-changing").

**Form.** Near-square corners: `--wi-radius-control` (6px) for controls, `rounded-lg` /
`--wi-radius-card` (10px) for cards. Hairline `#d6d6d6` borders; emphasis borders full black at
1.5–2px. Low, tight, neutral shadows (`--wi-shadow-sm/md/lg`) — no colored glows, no gradients,
no textures, no decorative illustration. Full-bleed black panels are the primary graphic device. Controls use `--wi-radius-control`, never `rounded-sm` (which coincidentally also computes to 6px).

**Motion.** Animate with **Motion** (`motion/react`, the `motion` package) — not hand-rolled CSS
keyframes or `IntersectionObserver`. Quick, precise, **no visible bounce** (WITHIN is introverted);
fades and short slides only, no infinite decorative loops.
- Reuse the shared primitives in [src/components/coming-soon/Reveal.tsx](src/components/coming-soon/Reveal.tsx):
  `Reveal` (scroll fade+lift, once), `RevealGroup` + `RevealItem` (staggered children, 30–80ms apart),
  and the exported `EASE` curve `[0.16, 1, 0.3, 1]` (= `--wi-ease-out`). Use `EASE` for every tween.
- Wrap animated trees in [MotionProvider](src/components/coming-soon/MotionProvider.tsx)
  (`<MotionConfig reducedMotion="user">`) so motion honors `prefers-reduced-motion` (drops movement, keeps fades).
- Only animate `transform` and `opacity` (GPU); avoid animating layout props except the few
  deliberate cases (bar `width`, accordion `height` via `AnimatePresence`).
- Durations: micro-interactions 120–250ms; scroll reveals ~500–900ms. Springs are allowed only
  with `bounce` ≈ 0. Don't animate anything a user triggers dozens of times a day.

**Icons.** Lucide only (`lucide-react`) — stroke, ~2px, `currentColor`. **Never emoji.** The
logomark is a brand mark, not an icon.

**Logo.** Always use `WithinLogo` (or the PNGs in `public/brand/`). **Never redraw, trace, or
approximate the mark.**

## Data Fetching & Services

This site is fully static and has **no data fetching** today — there is no backend, no API
route, and no `services/` layer. This section exists so the cross-references above resolve.

When server-side data first becomes necessary:
- Fetch inside the relevant async `page.tsx` / `layout.tsx` Server Component (or a Server
  Component it renders), then pass plain data down to presentational components as props.
- Presentational components never fetch. Extract non-trivial transforms into a
  `<noun>.service.ts` (static methods) or a `utils/` helper.
- Introduce `src/services/` only when the first service module appears, and update this section.

## When in Doubt

Stop and ask. Parent CLAUDE.md §1 applies: surface tradeoffs, name what's confusing, don't pick silently. When a needed component, token, abstraction, dependency, or env var doesn't exist, propose options before writing code.
