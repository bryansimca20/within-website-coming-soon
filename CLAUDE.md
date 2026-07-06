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
│   └── ui/           # shadcn/ui primitives — CLI-managed, do not hand-edit
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
- Always prefer shadcn/ui over custom implementations. Check [src/components/ui/](src/components/ui/) first; never modify those files by hand (regenerated by the CLI).
- If a needed shadcn component is **not installed**, stop and tell the user — let them install (`npx shadcn@latest add <component>`) or take a different approach. Do not hand-roll a substitute.
- If a component does **not exist in shadcn at all**, surface options before writing code.
- Icons: `lucide-react` only. **Data viz:** Recharts (wrapped with shadcn `<ChartContainer>`) · Mapbox via `react-map-gl`. (Neither is installed yet — install when first needed.)

**Styling**
- Tailwind utilities directly in JSX. No inline `style={}` unless the value is dynamic (transforms, Mapbox sizing, `touchAction`, etc.).
- Use `cn()` from [src/lib/utils.ts](src/lib/utils.ts) for conditional classes.
- Extract a component for repeated multi-class patterns — never extract a CSS class.

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
