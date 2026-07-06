# WITHIN Design System Framework — Design Spec

**Date:** 2026-07-06
**Project:** `within-website-coming-soon` (Next.js 16 · Tailwind v4 · shadcn base-nova)
**Status:** Approved for planning

## 1. Goal

Convert the bare `create-next-app` scaffold into a **guardrail foundation** that forces
on-brand output when the real coming-soon design lands in a later step. The framework
encodes the **Within Design System** (Claude Design project `9a760727-dad3-4223-afd7-78934815824f`,
"Within Design System" — NOT the V3 variant) as: design tokens, the Inter font, brand assets,
a small set of restyled/brand components, and written CLAUDE.md rules.

This spec covers the foundation only. **No coming-soon page content is designed here** —
the actual page design arrives separately and plugs into this foundation.

### Non-goals (deferred / YAGNI)
- Restyling shadcn primitives beyond Button (Input, Select, Card, Tabs, Badge, …) — done
  when the real design first needs each one.
- Importing the DS compiled React bundle (`_ds_bundle.js` / `window.WithinDesignSystem_9a7607`) —
  rejected; it is a UMD window-global that fights RSC/Turbopack.
- Any actual marketing copy, hero, product imagery, or layout.

## 2. Locked decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | DS consumption | Port DS token CSS into Tailwind v4 `@theme`; restyle shadcn. No bundle import. |
| 2 | Theming | Strip the scaffold's `.dark` system. One monochrome light theme. Black is an explicit device (`bg-wi-black` / inverse Card), not a toggle. |
| 3 | Scope | Foundation + Button restyle + brand helpers (Logo, WiEyebrow, WiHero). |
| 4 | Font | Inter Variable via `next/font/local`. |
| 5 | Button restyle location | Rebrand `ui/button.tsx` CVA directly; update the CLAUDE.md "don't hand-edit ui/" rule to note primitives are WITHIN-restyled and must be reapplied after any CLI re-add. |

## 3. Design tokens — `src/app/globals.css`

The whole DS is four values, one typeface, 4px spacing, near-square corners, hairline
borders, low neutral shadows, quick no-bounce motion. Port all five DS token files
(`colors.css`, `typography.css`, `foundations.css`, `base.css`, `fonts.css`).

### 3.1 Token strategy — avoid name collisions
shadcn's `@theme` and WITHIN both define `--radius-sm/md/lg` (and Tailwind owns `--text-*`,
`--font-*`, etc.). To prevent clobbering:

- **Raw WITHIN tokens** live in `:root` under a consistent `--wi-` prefix
  (colors are already `--wi-*`; add the prefix to type/space/radius/shadow/motion:
  `--wi-radius-control: 6px`, `--wi-radius-card: 10px`, `--wi-shadow-sm`, `--wi-ease-standard`,
  `--wi-duration-fast`, `--wi-tracking-label`, `--wi-weight-bold`, `--wi-text-display-2xl`, …).
- **shadcn semantic bridge** — set shadcn's expected vars to WITHIN values (table below).
- **Keep `--radius: 0.625rem` (10px)** so shadcn `rounded-lg` = 10px = WITHIN card radius.
  Controls use `rounded-[var(--wi-radius-control)]` (6px) explicitly in the Button restyle.

### 3.2 shadcn semantic → WITHIN mapping

| shadcn token | WITHIN value |
|---|---|
| `--background` | `var(--wi-paper-dim)` `#f2f2f2` |
| `--foreground` | `var(--wi-charcoal)` `#191919` |
| `--card` / `--popover` | `var(--wi-paper)` `#ffffff` |
| `--card-foreground` / `--popover-foreground` | `var(--wi-black)` |
| `--primary` | `var(--wi-black)` `#000` |
| `--primary-foreground` | `var(--wi-paper)` |
| `--secondary` | `var(--wi-mist)` `#e6e6e6` |
| `--secondary-foreground` | `var(--wi-black)` |
| `--muted` | `var(--wi-mist)` |
| `--muted-foreground` | `var(--wi-ink-500)` `#6b6b6b` |
| `--accent` | `var(--wi-mist)` |
| `--accent-foreground` | `var(--wi-black)` |
| `--destructive` | `var(--wi-charcoal)` (status is monochrome — no hue anywhere) |
| `--border` / `--input` | `var(--wi-line)` `#d6d6d6` |
| `--ring` | `var(--wi-black)` |
| `--chart-1..5` | greyscale ramp from existing neutral values (kept; unused) |

All values are plain hex/rgb from the DS (not oklch); the DS palette has **no hue** so the
scaffold's oklch neutrals are replaced with exact DS hex.

### 3.3 `@theme` exposure (Tailwind utilities)
Expose WITHIN raws so they are usable as utilities:
- Colors: `--color-wi-black`, `--color-wi-charcoal`, `--color-wi-ink-700/500/300`,
  `--color-wi-line`, `--color-wi-mist`, `--color-wi-paper-dim`, `--color-wi-paper`
  → `bg-wi-black`, `text-wi-ink-500`, `border-wi-line`, …
- Type scale via `--text-display-2xl…--text-2xs` → `text-display-xl`, `text-h1`, `text-2xs`.
- Font: `--font-sans` bound to the Inter variable (§4).

### 3.4 Base + voice
- Port DS `base.css` resets (`box-sizing`, body defaults, `::selection` black/paper).
- `html { font-family: var(--font-sans) }`; body `bg-background text-foreground`.
- **No italics anywhere** — do not add any `italic` utility usage; note in CLAUDE.md.
- The DS `.wi-eyebrow` / `.wi-hero` utilities are realized as React helpers (§5.3), not
  global classes (CLAUDE.md: extract a component, never a CSS class).

### 3.5 Cleanup
- Delete the `.dark { … }` block and the `@custom-variant dark`.
- Remove `dark:` machinery from `@layer base`.

## 4. Font — `src/app/layout.tsx`

- Remove Geist / `Geist_Mono`.
- Load Inter Variable via `next/font/local`, `variable: "--font-sans"`, `display: "swap"`.
- **TTF acquisition:** binary can't be pulled from Claude Design (`read_file` is text-only,
  256 KiB cap). Inter is OFL — download the official Inter variable TTF (byte-equivalent to
  the DS's shipped `assets/fonts/Inter-Variable.ttf`) into
  `src/app/fonts/Inter-Variable.ttf`. **Fallback:** if the environment is offline, use
  `next/font/google` `Inter` (auto self-hosted at build) and note the substitution.
- Update `<html>` to apply the font variable; drop the two Geist variables.
- Update `metadata` title/description to WITHIN (placeholder, e.g. `WITHIN — Coming soon`).

## 5. Components

### 5.1 Button — rebrand `src/components/ui/button.tsx`
Rewrite the CVA to the DS `Button.jsx` contract (read from the DS project):

- **Base:** `uppercase tracking-[0.14em] font-bold leading-none rounded-[var(--wi-radius-control)]`,
  `transition` on background/color/opacity/transform at `--wi-duration-fast`/`--wi-ease-standard`,
  press `active:scale-[0.97]`, focus ring `focus-visible:ring-[3px] ring-black/16`,
  `disabled:opacity-40 disabled:cursor-not-allowed`.
- **Variants** (map to DS primary/secondary/ghost/inverse; keep shadcn names where possible):
  - `default` (= DS primary): `bg-wi-black text-wi-paper border border-wi-black hover:opacity-86`.
  - `outline`/`secondary` (= DS secondary): transparent, `border-[1.5px] border-wi-black text-wi-black`,
    `hover:bg-wi-black hover:text-wi-paper`.
  - `ghost`: transparent, `hover:bg-wi-mist`.
  - `inverse` (new): `bg-wi-paper text-wi-black` for dark surfaces.
  - `destructive`/`link` retained but monochrome (destructive → charcoal, no hue).
- **Sizes** (DS heights): `sm` 34px / `text-xs`, `default`(md) 44px / `text-sm`,
  `lg` 54px / `text-body`; icon sizes squared to match. Keep DS horizontal padding
  (sm 14px, md 22px, lg 30px) and gaps.
- Keep the Base UI `ButtonPrimitive`, `data-slot`, `VariantProps` export surface intact so
  existing/​future consumers and other shadcn components keep working.

### 5.2 Logo — `src/components/brand/WithinLogo.tsx`
Wraps the official PNGs (never redraw the mark). Assets copied from `../Designs/` (repo
sibling) into `public/brand/`:
- `Within_Logotype-01.png` → `public/brand/within-logotype.png` (black on transparent)
- `Within_Logomark-01.png` → `public/brand/within-logomark.png` (black on transparent)

(`-01` is the black/transparent variant per the DS guide. Confirm visually at build time.)

API (`WithinLogoProps`):
- `kind: "logotype" | "logomark"` (default `logotype`)
- `color?: "black" | "white"` (default `black`; `white` = CSS `invert()` on the black PNG)
- `height?: number` (width auto)
- `alt?: string` (default `"WITHIN"`; `""`/decorative allowed)
Renders `next/image` with explicit width/height; `priority` optional via prop.

### 5.3 Voice helpers — `src/components/brand/`
Two presentational components encoding the two type registers so copy can't drift:
- `WiEyebrow.tsx` — `<WiEyebrow>` → uppercase, `tracking-[0.14em]`, `text-2xs`, bold,
  `text-muted-foreground`. Renders `<p>`/`<span>` (element via prop, default `span`).
- `WiHero.tsx` — `<WiHero>` → Inter Bold 700, `uppercase`, `tracking-[-0.03em]`,
  `leading-[0.98]`, `text-wi-black`. Renders a heading (`as` prop, default `h1`);
  size via a `size` prop mapping to the display scale (`display-2xl`…`h1`).

Both: named export, `<Name>Props` interface directly above, one-line doc comment, `cn()`
for class merge, forward `className` + `children`. Follow all CLAUDE.md conventions.

## 6. CLAUDE.md guardrail rules

Add a **"WITHIN Design System"** section (the durable guardrail the later design step reads):

- **Monochrome only.** Palette is exactly `#000 / #191919 / #f2f2f2 / #fff`. **No hue anywhere** —
  no colored accents, no green/red status. Hierarchy = weight, fill, contrast. Use `--wi-*`
  tokens / `wi-*` utilities; never invent a color.
- **Type.** Inter only, **no italics anywhere**, upright at every weight. Hero/label voice =
  Bold 700, UPPERCASE, tight tracking. Body = 400/500, leading 1.5. Use `WiHero`/`WiEyebrow`
  for the voice registers.
- **Voice/copy.** Honest, introverted, high-performing. Short declaratives, subtractive
  framing, facts over adjectives, Rupiah (`Rp 45.000`, dot thousands). No emoji, no
  exclamation, no hype words.
- **Form.** Near-square corners (6px controls / 10px cards), hairline `#d6d6d6` borders,
  low neutral shadows (no glows/gradients/textures), quick no-bounce motion (120–320ms).
- **Icons.** Lucide only (stroke, `currentColor`). No emoji. No redrawing the logomark.
- **Logo.** Always `WithinLogo` (or the `public/brand/` PNGs). Never trace/recreate.
- **Amend the shadcn rule:** `ui/` primitives are **WITHIN-restyled** and owned in-repo.
  They may be hand-edited to carry brand styling. Re-running `npx shadcn add <c>` overwrites
  the file — **reapply the WITHIN restyle after any CLI re-add** and diff before committing.
- Update the Tech Stack / fonts lines (Inter, not Geist) and any dark-mode references.

## 7. Cleanup

- `src/app/page.tsx` → minimal WITHIN placeholder (centered logotype + one honest line +
  eyebrow), using the new components/tokens. Not the final design — a smoke test that the
  foundation renders on-brand. Confirm scope with user if richer.
- Delete unused `public/*.svg` (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`,
  `window.svg`) and the `next/image` demo imports.

## 8. Verification

- `npm run build` succeeds (Turbopack, static prerender of `/`).
- `npm run lint` passes (no `any`, named exports, no `!`, doc comments present).
- Dev server renders `/`: off-white page, Inter, black logotype, uppercase-tracked
  placeholder — visibly monochrome and on-brand.
- Button smoke check: `default` renders black uppercase tracked with 6px corners; hover
  drops opacity; press scales.
- Grep guard: no `dark:` variants, no `oklch(`, no `italic`, no non-DS hex remain in
  `globals.css` / components.

## 9. Files touched

**Edit:** `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`,
`src/components/ui/button.tsx`, `CLAUDE.md`.
**Add:** `src/app/fonts/Inter-Variable.ttf`, `public/brand/within-logotype.png`,
`public/brand/within-logomark.png`, `src/components/brand/WithinLogo.tsx`,
`src/components/brand/WiEyebrow.tsx`, `src/components/brand/WiHero.tsx`.
**Delete:** `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`,
`public/window.svg`.
