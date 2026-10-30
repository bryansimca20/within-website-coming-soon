# Transparency Lab

The design system for `/cohort`, the 404 and `/admin`. `/` and `/sample*` run the WITHIN brand system in [DESIGN.md](../DESIGN.md) instead. Source of truth: Claude Design project `9a760727-dad3-4223-afd7-78934815824f` ("Within Design System"). Tokens live in [globals.css](../src/app/globals.css) (`@theme` + `:root`).

## Color

Paper-white clinical canvas, cool-tinted greys, one true-black signal.

- Ink: `--wi-black` `#0b0d12`, `--wi-charcoal` `#1a1e26`, `--wi-ink-700` `#363d49`, `--wi-ink-500` `#626b7a`, `--wi-ink-300` `#9aa3b2`
- Surfaces: `--wi-line` `#e2e7ee`, `--wi-mist` `#eceff4`, `--wi-paper-dim` `#f6f8fb`, `--wi-paper` `#ffffff`
- `--wi-signal` `#000000` (stepped by `--wi-signal-bright` `#262c36` and the `--wi-signal-tint` `#e3e7ef` wash) marks actives and live data. Resting states step down to ink rather than compete with it.
- `--wi-flag` `#ce1126` is reserved for the Indonesian flag, not a general accent.
- Status: `--wi-error` `#e5484d`, `--wi-success` `#30a46c`.

Use `--wi-*` tokens, `wi-*` utilities, or the shadcn semantic tokens (`bg-primary`, `text-muted-foreground`). Never invent a color, never use `oklch`, never a `dark:` variant (`viewport.colorScheme` is `"light"` only).

## Type

Geist Sans for display and body, Geist Mono for readouts, both from the `geist` package. Readouts (numerals, status strings) use the `.wi-readout` utility.

Scale from `@theme`: `text-display-2xl` (96px), `text-display-xl` (72px), `text-display-lg` (56px), `text-display-md` (40px), `text-h1` (34px), `text-h2` (26px), `text-h3` (20px), `text-body-lg` (18px), `text-body` (16px), `text-2xs` (11px). Some steps have no consumer, which is expected for a declared ramp. Hero and label type is hand-set per component; there is no shared hero component.

## Voice

Honest, introverted, high-performing. Short declarative statements. Subtractive framing ("No additives. Just what works."). Facts over adjectives ("1000mg sodium" beats "packed with electrolytes"). Second person, sparingly. Prices in Rupiah (`Rp 45.000`, dot thousands).

## Form

Crisp, near-flush corners, applied as CSS-variable arbitrary values rather than the Tailwind `rounded-*` scale: `rounded-[var(--wi-radius-control)]` (2px) on controls, `rounded-[var(--wi-radius-card)]` (3px) on cards and dialogs. Cool-tinted shadows only (`--wi-shadow-*`), never a colored halo.

## Motion

- Use Motion rather than hand-rolled keyframes or `IntersectionObserver`. Fades and short slides only, no infinite decorative loops.
- [Reveal.tsx](../src/components/coming-soon/Reveal.tsx) exports `Reveal` (fade + lift into view once) and the `EASE` curve `[0.23, 1, 0.32, 1]`, which matches `--wi-ease-out`. Use `EASE` for every tween. Stagger a group with increasing `delay` values (30-80ms apart).
- [MotionProvider](../src/components/coming-soon/MotionProvider.tsx) (`<MotionConfig reducedMotion="user">`) wraps animated trees from the route layout, so motion drops movement and keeps fades under `prefers-reduced-motion`.
- Durations: `0.22s` to `0.45s` for micro-interactions and overlays, about `0.5s` to `1s` for scroll reveals. Springs only with `bounce` near 0. Layout props are not animated, except a deliberate accordion `height`.

## Admin

- Admin runs shadcn's sidebar, table, select, input, label, badge, separator, sheet, skeleton and tooltip, restyled to `wi-*` tokens and `--wi-radius-*`. The `--sidebar*` tokens in `globals.css` map onto `wi-*`. `button.tsx` and `dialog.tsx` are hand-owned.
- Admin is softer than the public pages on purpose: `src/app/admin/layout.tsx` sets `data-admin`, and `:root:has([data-admin])` in `globals.css` raises the radii (10px control, 16px card) and switches the button to sentence case through `--wi-button-*`.
- Admin surfaces are `bg-wi-paper` + `shadow-[var(--wi-shadow-card)]` with no border. Statuses render through `AdminStatusPill`.
