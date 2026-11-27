# Waitlist (`/`)

One-screen page, statically prerendered, from the waitlist design handoff (comp 2c, "feature orbit", on both phone and desktop). Tokens and type are in [DESIGN.md](../DESIGN.md). It reads no server-side data, has no database, and writes in one place: Shopify customers.

## Page

- One viewport with no scroll (`h-dvh overflow-hidden`). Phone and desktop comps switch at `desk:` (900px).
- The floating sachet is a CSS keyframe (`animate-sachet-float`), off under reduced motion. It is the design's one sanctioned loop.
- The opening plays once, in CSS only so it starts at first paint rather than after hydration: the dotted ring fills clockwise from the bottom-right tile (an SVG mask whose `stroke-dashoffset` transitions from `@starting-style`), each tile lands as the fill passes it, and the headline, subline and button rise 8px over 300ms in a 50ms stagger (`tw-animate-css` `animate-in`). The sachet only rises, never fades: it is the phone's LCP element, and an opacity fade delays LCP. All of it is off under reduced motion.
- Hover speaks one language, the ink stamp the joined button uses: a tile floods ink from the left, and the orange button draws an ink rule along its bottom edge. The button's hidden layers carry `visibility` timed to their fades, so its accessible name always matches the words on screen.
- A skip link ("Skip to the waitlist button") is the first tab stop and lands on the button (`#join`). The header sits outside `<main>`.
- Icons are the hand-drawn SVGs in `components/waitlist/svg/`.
- Every string, layout and feature lives in `components/waitlist/utils/waitlist-copy.ts`.
- Interactions go through `trackWaitlistEvent()` in `waitlist-analytics.ts`.
- [dialog.tsx](../src/components/ui/dialog.tsx) carries behaviour only (focus trap, Escape, focus return, fade); each caller positions the popup and sets its surface. The phone bottom sheet is this same Dialog pinned to the bottom edge.

## Signup path

`WaitlistForm` mounts inside `WaitlistSheet` (a bottom sheet on phones, a centred modal on desktop), opened by the one orange button. On `/sample`, `SampleWaitlistButton` opens the same sheet and confirmation in place (coming soon and batch full), so visitors join without leaving the page.

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

- Fields run email, name, Instagram, all required. `SUBSCRIBER_FIELD_ORDER` and `validateField` in `subscriber-input.ts` drive both the form and the server check. Each field is checked on blur and on submit.
- The form calls the action directly rather than through `useActionState`, because the sheet keeps the typed values for "Edit my details".
- On success the sheet closes and `WaitlistJoinedDialog` opens: a centred popup at every size that thanks the visitor by first name, signed WITHIN / Jakarta, with the Instagram follow as the next step. The orange button stamps to ink with a check (`data-joined`) and reopens that popup from then on.
- "Edit my details" re-opens the form. A second submit with the same email is a duplicate, which reports success and changes nothing in Shopify.
- `/` must stay listed in `initBotId({ protect })`.
