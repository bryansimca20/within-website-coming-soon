---
name: WITHIN
description: The WITHIN brand system. Ink on paper, square corners, Inter at regular weight, and one warm orange accent. Runs `/` (the waitlist) and every `/sample` page.
colors:
  brand-black: "#000000"
  brand-ink: "#191919"
  brand-mist: "#f2f2f2"
  brand-white: "#ffffff"
  brand-muted: "#6b6b6b"
  brand-muted-dark: "#8c8c8c"
  flavor-orange: "#ff8326"
  brand-error: "#d0312d"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "64px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.03em"
  hero:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "48px"
    fontWeight: 400
    lineHeight: "52px"
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: "48px"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: "36px"
    letterSpacing: "-0.02em"
  card-title:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: "34px"
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: "30px"
    letterSpacing: "-0.02em"
  title-sm:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "28px"
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "26px"
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "normal"
  control:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "normal"
  small:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "normal"
  field:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: "16px"
    letterSpacing: "0.06em"
  micro:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: "16px"
    letterSpacing: "0.06em"
  script:
    fontFamily: "Biro Script Plus, cursive"
    fontSize: "80px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  gutter: "16px"
  page-margin-desk: "48px"
  column-form: "560px"
  column-intro: "1040px"
components:
  button-primary:
    backgroundColor: "{colors.brand-ink}"
    textColor: "{colors.brand-mist}"
    rounded: "{rounded.none}"
    height: "56px"
    padding: "0 20px"
  button-accent:
    backgroundColor: "{colors.flavor-orange}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.none}"
    height: "56px"
    padding: "0 20px"
  choice-chip:
    backgroundColor: "{colors.brand-white}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.none}"
    height: "44px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.none}"
---

# Design System: WITHIN

## Scope

This file describes the **WITHIN brand system**, the live system on `/` (the one-screen waitlist) and on every `/sample` page (the intro, the five-step request, the status page and the feedback form). Its source is the waitlist design handoff in `../within-waitlist-handoff` (`assets/within-tokens.json`) and the WITHIN Logo & Brand Identity Guideline.

Two older surfaces still run the previous **Transparency Lab** system: `/cohort` and the 404 page. `/admin` runs Transparency Lab tokens too. Those routes use the `--wi-*` tokens in `globals.css`, described in docs/transparency-lab.md. Do not mix the two systems on one route.

## Overview

WITHIN is quiet. The product is a black sachet with one orange flavour, and the pages read the same way: ink on white, square edges, regular-weight Inter, and a single warm accent. Persuasion comes from plain facts and space, not volume. Headlines are regular weight; emphasis comes from weight, never colour.

**Key characteristics**
- White paper ground, `#191919` ink, `#f2f2f2` mist for quiet fills
- One accent, Flavor Orange, used once per view
- Inter at 400 for headlines, 600 to 700 for emphasis and labels
- Square corners everywhere; the only round shape is the dotted orbit circle on `/`
- No shadows on UI; product renders may carry their own floor shadow
- Phone and desktop layouts switch at one breakpoint, `desk:` = 900px

## Colors

### Primary
- **Ink** (`#191919`): Text, primary button fills, selected chips, control borders, the header rule. The everyday dark.
- **White** (`#ffffff`): The page ground.
- **Mist** (`#f2f2f2`): Text on Ink, unfilled progress segments, loading placeholders, quiet fills.
- **Black** (`#000000`): Packaging and product renders only. Not a UI colour.

### Accent
- **Flavor Orange** (`#ff8326`): The one accent. Used for the single most important action on a view (the waitlist button, the "Pay shipping" button), a highlighted stat, or the orbit glow. Text on it is always Ink (7.1:1). Orange text on white fails contrast (2.5:1), so never set text in orange.

### Status
- **Error Red** (`#d0312d`, `brand-error`): Errors only. The message under a field and the field's 2px error underline, plus form-level and loading failures. 5.05:1 on white, so it passes for 13px text. Never a button, a highlight or decoration, and never mixed up with Flavor Orange.

### Derived neutrals
- **Muted** (`#6b6b6b`): Captions, field labels, hints, step counters, section labels on white.
- **Muted Dark** (`#8c8c8c`): Muted text on dark grounds, and scale annotations.

### Named rules
**One accent per view.** If two things on a screen are orange, one of them is wrong.

**Emphasis is weight, never colour.** Bold a phrase; don't tint it.

**Red means something went wrong.** Error Red is the only colour that carries a status, and it appears only next to the thing that needs fixing.

## Typography

**Sans:** Inter (`font-brand`), weights 400, 600, 700.
**Script:** Biro Script Plus (`font-script`), for the "see you soon" accent only. The supplied cut has letters only, so numbers and punctuation stay in Inter.

### Hierarchy
The ramp is a set of fixed sizes, hand-set per component with Tailwind arbitrary values (`text-[32px] leading-9`). There is no shared heading component.

| Step | Size / line | Weight | Tracking | Used for |
| --- | --- | --- | --- | --- |
| display | 64 / 1, fluid from 40 | 400 | -0.03em | The waitlist headline on desktop |
| hero | 48 / 52 | 400 | -0.02em | The `/sample` intro headline on desktop |
| headline-lg | 44 / 48 | 400 | -0.02em | The `/sample/r/[token]` status headline on desktop |
| headline | 32 / 36 | 400 | -0.02em | Page headlines on phone; step headings and sheet titles on desktop |
| card-title | 30 / 34 | 600 to 700 | -0.01em | Fact and heat card titles on desktop |
| title | 26 / 30 | 400 | -0.02em | Step headings and sheet titles on phone |
| title-sm | 24 / 28 | 600 to 700 | -0.01em | Card titles on phone |
| body-lg | 17 / 26 | 400 | normal | Lead paragraphs (the intro copy, the waitlist subline) |
| body | 16 / 24 | 400 | normal | Inputs (16px stops iOS zoom), buttons, area names |
| control | 15 / 22 | 400 to 600 | normal | Chips, chip-group legends, checkbox sentences, courier rows, Back |
| small | 14 / 20 | 400 to 600 | normal | Secondary lines |
| field | 13 / 18 | 400 to 600 | normal | Field labels, hints, error lines, fine print under buttons |
| label | 12 / 16 | 700 | 0.06em | Uppercase section labels and step names ("SAMPLE BATCH 01", "ABOUT YOU") |
| micro | 11 / 16 | 700 | 0.06em | Orbit tile tags and scale annotations on phone |

Headlines use `text-balance`; paragraphs use `text-pretty`. Numbers that line up (counts, prices) use `tabular-nums`.

### Named rules
**Regular headlines.** Headlines stay at 400. Weight is spent on labels, emphasis and buttons.

**Labels are the only uppercase.** One small uppercase label may sit above a headline (the batch label, the step name). Body copy, headings and buttons are sentence case.

## Layout

- **Phone:** one column, 16px gutters. **Desktop (`desk:`, 900px+):** 48px page margins.
- `/` is one viewport with no scroll (`h-dvh overflow-hidden`).
- `/sample` scrolls. The form steps sit in a 560px column. The intro widens to 1040px on desktop, as two columns: the 3D box on the left, the words and button on the right.
- On phones the intro's main button docks to the bottom of the viewport (sticky, white fade above it) so it's always within reach.
- Leave space. Related blocks sit 32px apart; fields within a group sit 16px apart; chip groups 28px apart.

## Elevation and depth

Flat. Layers come from Ink rules and white space, not shadows. The one exception is product imagery: the floating sachet on `/` and the 3D box on `/sample` carry their own soft floor shadow as part of the render. Dialogs are flat white panels; the backdrop does the separating.

## Shapes

- Square corners on everything: buttons, chips, inputs, cards, dialogs, images.
- Borders are 1px Ink (controls, chips, courier rows) or 1px Muted (input underlines). An input in error thickens its underline to 2px Error Red.
- The only round element is the dotted orbit circle on `/`.

## Components

### Buttons
- **Primary:** Ink fill, Mist text, 56px tall, label left and arrow glyph right, 16px semibold.
- **Accent:** Flavor Orange fill, Ink text, same shape. One per view: the waitlist button on `/`, the pay button on `/sample`.
- **Text button:** no fill, 15px semibold, at least 44px tall (Back, Change, Try again).
- Press feedback on every button: `active:scale-[0.97]`, 150ms on `ease-brand`.
- Focus: 2px solid Ink outline, 2px offset.

### Fields
- Underlined, no box: 13px muted label above, 16px input, 1px Muted underline. Error: 2px Error Red underline and a 13px semibold Error Red message below. Hints sit below in 13px Muted.
- Never use the placeholder as the label.

### Choice chips
- Native radios, visually hidden, inside 44px-tall bordered labels. Selected: Ink fill, Mist text. Pressing scales to 0.97.

### Progress (the `/sample` steps)
- Back at the top left. Under it, five 4px bars in a row: reached steps fill Ink from the left, the rest stay Mist. Under them, the step name (label style) and "Step N of 5".

### Product renders
- The floating sachet (`/`) and the `SampleBox3D` turntable (`/sample`). Both sit on white with no frame.

## Motion

Quick, precise, no bounce. Library: `motion/react`, inside `MotionProvider` (`reducedMotion="user"`). Ease: `cubic-bezier(0.23, 1, 0.32, 1)` (`ease-brand` in CSS, `EASE` in code).

- Animate `opacity` and transform keys only. In Motion, use `x`, `y` and `scaleX`, not a `transform` string: reduced motion only drops the named keys.
- Entrances: 8px lift and fade, 300ms, staggered 50ms.
- Step changes: 12px slide in the direction of travel, enter 240ms, exit 140ms.
- Button press: scale 0.97, 150ms.
- The sachet float on `/` is the one sanctioned loop. Nothing else loops, loading states included.
- Under reduced motion: no movement, fades stay.

## Do's and don'ts

### Do
- Keep one orange moment per view, with Ink text on it.
- Show every error in Error Red, directly under what caused it.
- Set headlines at 400 and let space carry them.
- Keep every corner square.
- Keep every visitor-facing string in the route's copy file (`waitlist-copy.ts`, `sample-copy.ts`).

### Don't
- Don't set text in orange, or use orange as a page ground.
- Don't add shadows, gradients or rounded corners to UI.
- Don't add a second accent colour. Error Red is a status, not an accent.
- Don't use Transparency Lab tokens (`--wi-*`, Geist) on `/` or `/sample`.
- Don't claim any certification. BPOM and Halal are pending, not certified.
- No em dashes, no exclamation marks, no hype words in copy.
