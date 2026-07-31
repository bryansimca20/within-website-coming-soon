---
name: WITHIN
description: Transparency Lab — a clinical, fact-forward electrolyte brand where the dose and every ingredient are read off the page like an instrument.
colors:
  electric: "#0047ff"
  electric-bright: "#3d6bff"
  electric-tint: "#e8eeff"
  ink: "#0b0d12"
  ink-700: "#363d49"
  ink-500: "#626b7a"
  ink-300: "#9aa3b2"
  line: "#e2e7ee"
  line-strong: "#cfd6e0"
  mist: "#eceff4"
  paper-dim: "#f6f8fb"
  paper: "#ffffff"
  flag: "#ce1126"
  error: "#e5484d"
  success: "#30a46c"
typography:
  display:
    fontFamily: "Geist Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(30px, 6.4vw, 72px)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(30px, 4vw, 52px)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Geist Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  readout:
    fontFamily: "Geist Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "clamp(24px, 7vw, 88px)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  label:
    fontFamily: "Geist Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  control: "2px"
  card: "3px"
  pill: "9999px"
spacing:
  gutter: "20px"
  gutter-lg: "28px"
  section-y: "80px"
  section-y-lg: "112px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 22px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 22px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  specimen-frame:
    backgroundColor: "{colors.paper-dim}"
    rounded: "{rounded.card}"
---

# Design System: WITHIN

## Overview

**Creative North Star: "The Transparency Lab"**

WITHIN reads like a bench instrument, not a sports-drink billboard. The product's one honest claim is its dosing, so the whole page is built to let a visitor *measure* it: a paper-white clinical field ruled with a faint measurement grid, the sachet framed as a specimen under register marks, and every number set in a mono readout that ticks up like a meter settling. Persuasion here is proof, not volume. The page dissects the product on scroll, prints the exact doses on a single dark instrument panel, and lays the full ingredient list open beside an explicit "what is not in it" ledger.

The system is deliberately quiet in hue and loud in precision. There is exactly one chromatic voice, an electric blue, and it is spent only where there is live data or an active choice; everything else is ink on paper separated by hairlines. The character rejects the two defaults this category always reaches for: the sugary, high-saturation sports-drink hero, and the generic three-up "icon + heading + text" supplement grid. Depth comes from tone and rule weight, never from soft drop shadows or glass.

**Key Characteristics:**
- Clinical paper-white canvas over a hairline measurement grid
- One electric-blue signal, reserved for actives, live data, and focus
- Geist Sans display over Geist Mono numerals (every number is a readout)
- Crisp ~2px edges; register marks and crosshairs frame the product as a specimen
- Exactly one dark "instrument panel" moment (the dose); the rest stays light
- Motion is instrumentation: hairlines draw in, numbers count up, a specimen dissects on scroll

## Colors

A near-monochrome ink-on-paper field carrying a single saturated accent; red exists only as national provenance.

### Primary
- **Electric** (`#0047ff`): The one signal. Used on active-mineral marks, live-data segments (the sweat-loss scale, the WITHIN column in the comparison matrix), the "None" verdicts in the exclusions ledger, focus rings, and `::selection`. Its rarity is the whole point.
- **Electric Bright** (`#3d6bff`): The same signal tuned up for the dark instrument panel (the dose readouts and their register ticks), where `#0047ff` would sink into near-black.
- **Electric Tint** (`#e8eeff`): A faint electric wash behind the WITHIN column of the comparison matrix, marking the hero row without shouting.

### Neutral
- **Ink** (`#0b0d12`): Cool off-black. Headlines, primary button fills, the dark instrument panel, strong emphasis borders. Never pure `#000000`.
- **Ink 700** (`#363d49`): Body copy on paper.
- **Ink 500** (`#626b7a`): Secondary copy, captions, muted labels.
- **Ink 300** (`#9aa3b2`): Faint labels, axis numerals, disabled text.
- **Line** (`#e2e7ee`): The default hairline: dividers, the measurement grid, card borders.
- **Line Strong** (`#cfd6e0`): Register marks, crosshairs, input strokes.
- **Mist** (`#eceff4`): Secondary/muted surface fills.
- **Paper Dim** (`#f6f8fb`): Clinical off-white; alternating section surfaces and the specimen frame.
- **Paper** (`#ffffff`): The base canvas.

### Provenance (not an accent)
- **Flag Red** (`#ce1126`): Reserved exclusively for the literal Indonesian flag mark. It is never a UI color, never a CTA, never decoration.

### Named Rules
**The Single Signal Rule.** Electric appears only where there is live data or an active choice (actives, data marks, focus). If it is decorating a surface, it is wrong; remove it and let ink-on-paper carry the layout.

**The Flag Red Rule.** Red is national provenance, not brand color. The only red on the page is the flag itself.

**The One Dark Room Rule.** Exactly one section inverts to the dark instrument panel (the dose). No other section flips theme; the footer stays light.

## Typography

**Display Font:** Geist Sans (with -apple-system, BlinkMacSystemFont, sans-serif)
**Body Font:** Geist Sans
**Readout / Label Font:** Geist Mono (with ui-monospace, SF Mono, Menlo)

**Character:** A precise, engineered grotesque paired with its monospace sibling. Sans carries voice and argument in sentence case at medium weight with tight tracking; mono carries every measurement. The pairing reads as instrumentation, not editorial.

### Hierarchy
- **Display** (500, `clamp(30px,6.4vw,72px)`, 0.98, tracking -0.04em): The hero and closing headlines. Sentence case, never all-caps.
- **Headline** (500, `clamp(30px,4vw,52px)`, 1.0, tracking -0.035em): Section headlines.
- **Body** (400, 17px, 1.55): Explanatory copy; measure held to ~44-46ch.
- **Readout** (600, `clamp(24px,7vw,88px)`, tabular-nums, tracking -0.02em): Every dose and data numeral. Counts up from zero when first scrolled into view.
- **Label** (500, 11px, tracking 0.14em, uppercase, mono): Data annotations only — units, axis numbers, `PER SACHET · IN 500ML WATER`, mineral symbols.

### Named Rules
**The Measurement Voice Rule.** Every number is Geist Mono and tabular. Prose is never mono. Mono is for data, units, and measurement, never as a costume for "technical."

**The No-Eyebrow Rule.** Headings carry their own weight. There is no small uppercase kicker above any heading, anywhere.

## Layout

A centered 1240px max-width column with a 20px (mobile) / 28px (desktop) gutter. Vertical rhythm runs `py-16` on phones to `py-20`-`py-28` from `md` up, with more space above a heading than below it. Section surfaces alternate quietly between Paper and Paper Dim; a faint measurement grid (32px cells, 26px on phones) underlays hero, dissection, dose, and the closing section, always masked to fade at the edges so it never competes with content.

High-variance splits (hero specimen, why-scales, dissection) are two-column from `lg` and collapse to a single column below, content-then-visual in DOM order. The dissection pins the specimen on desktop (`position: sticky`) while its readings advance with scroll; below `lg` and under reduced-motion it degrades to a static stacked reveal with all readings shown. The comparison matrix drops its Water column below `md` so phones never scroll sideways.

## Elevation & Depth

Depth is built from **tone and rule weight, not shadow.** Three stacked surfaces (Paper, Paper Dim, Ink) separated by hairlines create the sense of layers; register marks and crosshairs add the sense of a measured plane. Shadows are a functional response to floating only.

### Shadow Vocabulary
- **Specimen lift** (`drop-shadow: 0 20px 40px rgba(11,13,18,0.16)`): Under the floating sachet only, so it reads as lifted off its frame.
- **Overlay** (`box-shadow: 0 18px 44px rgba(11,13,18,0.12)`): The signup Dialog/Drawer.
- **Focus** (`box-shadow: 0 0 0 3px rgba(0,71,255,0.28)`): The electric focus ring on interactive elements.

### Named Rules
**The Tone-Not-Shadow Rule.** Surfaces are flat at rest. Layering is expressed by tonal surface + hairline, never by an ambient drop shadow. Shadows appear only under things that actually float (the sachet, dialogs) or as a focus response.

## Shapes

Crisp and technical. Corners are near-sharp: interactive controls and cards use a 2-3px radius (`--wi-radius-control: 2px`, `--wi-radius-card: 3px`); only the "coming soon" tag and icon chips go full pill. Borders are single 1px hairlines by default (`Line`); emphasis rules step to 1.5-2px in Ink to underline section headers and the strong table rows. Corner register ticks (short L-shaped 1px strokes) and centered crosshairs frame the product as a specimen. No colored border-left/right above 1px, ever.

## Components

### Buttons
- **Shape:** 2px radius (`--wi-radius-control`), semibold, uppercase, 0.1em tracking.
- **Primary:** Ink fill, Paper text; hover dims to 86% opacity. Padding `0 22px` at 44px height.
- **Secondary / Inverse:** Paper fill, Ink text (for the dark panel and photographic surfaces); hover dims to 86%.
- **Outline:** Transparent with a 1.5px Ink border; hover fills Ink with Paper text.
- **Feedback:** `active:scale(0.97)` press on every button; transitions run on the strong ease-out `cubic-bezier(0.23,1,0.32,1)` at 130ms.
- **Focus:** 3px electric ring (`ring-wi-electric/40`). No glow.

### Inputs / Fields
- **Style:** Paper fill, 1px `Line Strong` stroke, 2px radius. Label sits above the input; helper/error text below. Never placeholder-as-label.
- **Focus:** Electric ring. **Error:** stroke shifts to `error` (#e5484d), message in error below the field.

### Navigation
- Sticky, translucent Paper (`bg-wi-paper/85` + backdrop-blur), 1px `Line` bottom rule, 64px tall. Wordmark + a mono "Coming soon" status + Instagram + the primary "Join the list" action, always one line.

### Specimen Frame (signature)
- The product framed as a lab specimen: a Paper Dim panel with a 3px radius, an inset measurement grid, corner register ticks, and a centered crosshair, holding the sachet with a gentle infinite float. Used in the hero and the dissection.

### Instrument Panel (signature)
- The single dark section: Ink field, dark measurement grid, huge Geist Mono dose readouts with electric-bright register ticks and mineral symbols, counting up on reveal.

### Comparison Matrix (signature)
- A bordered grid, no per-row double hairlines. The WITHIN column carries an Electric Tint wash and electric-filled check marks; competitor columns use hairline marks with mono notes. Marks stamp in row by row on scroll.

## Do's and Don'ts

### Do:
- **Do** keep electric to actives, live data, and focus (The Single Signal Rule). If a surface is electric, it is wrong.
- **Do** set every numeral in Geist Mono, tabular, and let it count up from zero on first view.
- **Do** build depth from tonal surfaces + hairlines and frame the product with register marks and crosshairs.
- **Do** let each headline stand alone; sentence case, tight tracking, medium weight.
- **Do** hold exactly one dark instrument section (the dose) and keep everything else on the clinical light field.

### Don't:
- **Don't** put a kicker or eyebrow above any heading.
- **Don't** use mono for prose, or as decoration; mono is data only.
- **Don't** use red for anything but the literal Indonesian flag.
- **Don't** ship the sugary-sports-drink hero or the three-up "icon + heading + text" card grid.
- **Don't** add ambient drop shadows or glass for depth; only floating elements and focus earn a shadow.
- **Don't** claim any certification (BPOM / Halal are pending, not certified).
