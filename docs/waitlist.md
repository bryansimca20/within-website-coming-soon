# Waitlist (`/`)

One-screen page, statically prerendered, from the waitlist design handoff (comp 2c, "feature orbit", on both phone and desktop). Tokens and type are in [DESIGN.md](../DESIGN.md). It reads no server-side data, has no database, and writes in one place: Shopify customers.

## Page

- One viewport with no scroll (`h-dvh overflow-hidden`). Phone and desktop comps switch at `desk:` (900px).
- The floating sachet is a CSS keyframe (`animate-sachet-float`), off under reduced motion. It is the design's one sanctioned loop.
- Icons are the hand-drawn SVGs in `components/waitlist/svg/`.
- Every string, layout and feature lives in `components/waitlist/utils/waitlist-copy.ts`.
- Interactions go through `trackWaitlistEvent()` in `waitlist-analytics.ts`.
- [dialog.tsx](../src/components/ui/dialog.tsx) carries behaviour only (focus trap, Escape, focus return, fade); each caller positions the popup and sets its surface. The phone bottom sheet is this same Dialog pinned to the bottom edge.

## Signup path

`WaitlistForm` mounts inside `WaitlistSheet` (a bottom sheet on phones, a centred modal on desktop), opened by the one orange button.

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
