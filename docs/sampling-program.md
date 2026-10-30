# Sampling Program

Samples go out in numbered batches (Batch 01 was 100 boxes of three sachets, free, the sampler pays the courier). Specs are local in `docs/superpowers/specs/` (gitignored): `2026-10-20-sampling-program-design.md` and `2026-10-28-sample-batches-and-admin-design.md`.

## Routes and flow

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
/admin                                  overview: in transit, delivered, failed, feedback rate, failed and
                                        stuck deliveries with the courier's note, every batch side by side, New batch
/admin/reviews[?batch=&stars=]          review score: average stars, star split, taste, effectiveness, felt, each review
/admin/batches/[batchId]/requests       one batch: status, capacity, counts, search, ship runs
/admin/batches/[batchId]/export (+ /registrations, /feedback)  that batch's two CSVs
/admin/requests/[id]                    request detail, resends, reship
/admin/requests, /admin/export, /admin/batches, /admin/sample*  old links, redirect to the routes above
```

## Holds, webhooks and failures

- A request's 24-hour hold is ours; a Midtrans attempt lapsing (QRIS defaults to 15 minutes) ends only that attempt. `pending_payment` becomes `expired` lazily, whenever the count or a status page is read. The only cron is the check-in reminder.
- Webhook bodies are stored in `sample_webhook_events` before processing and every webhook is answered 200 once stored. Midtrans is trusted only after its SHA512 signature; Biteship bodies are never trusted, the order is re-fetched. A paid request is never moved backwards, and each once-only email has a guard column (`paid_at`, `shipped_email_sent_at`, `delivered_email_sent_at`).
- `MidtransService.createSnapTransaction`, `BiteshipService.createOrder` and `EmailService.send` never throw; they log and return null or false. A thrown error there once left unpaid holds occupying slots.

## Check-ins and reviews

- The check-in has two doors. The personal link (`?code=`, in the delivered and reminder emails and on the status page) identifies the sampler outright. The card's QR asks for the email first: it must belong to a shipped or delivered order with no check-in yet, or the form says why it can't go on. That does reveal whether an email claimed samples; the founder accepted it on 2026-10-22. Older unmatched rows are still listed in admin.
- The check-in is a review in four screens: stars + review (required), headline (optional, skippable), taste + effectiveness (1 to 5), how they felt. The first screen saves the row (`submitFeedbackAction`); each later one adds to it by its id (`addToFeedbackAction`), only within two hours of the last save, so leaving early still leaves a review.
- Rows from the old six-question form keep `session_type`, `session_length`, `would_reach_again` and `comment`; new rows leave them null, so intent is empty for them. Nothing publishes reviews yet; the share note under the first screen is the notice.
- One check-in reminder goes out 7 days after delivery, from the daily Vercel Cron in `vercel.json` (`/api/cron/feedback-reminders`, 02:00 UTC = 09:00 WIB). `feedback_reminder_sent_at` guards it. It carries five text stars (U+2606), each linking `?code=…&rating=N`, which pre-fills the stars. There is no thank-you email; the thank-you screen carries the Instagram follow.
- Review score (`summarizeReviews`) averages only rows with stars; old six-question check-ins have none but still count toward taste. Their `comment` shows as the review text.

## Copy, consent and routing

- Closed answer sets are stored as option keys from `src/app/utils/sample-options.ts`; labels live in `src/components/sample/utils/sample-copy.ts`; email copy in `src/services/sample-email-copy.ts`.
- `/sample*` runs the WITHIN brand system from `/` (and scrolls). `/admin` runs Transparency Lab tokens. Both are `noindex` and out of the sitemap.
- The launch-email box on step 1 is optional and unticked ("Email me when WITHIN launches."). Ticking it is the only marketing consent a sampler gives: it sets `consented_at` and subscribes them in Shopify. Order emails (paid, shipped, delivered, reminder) go to every sampler regardless.
- `/sample` and `/sample/feedback` must stay listed in `initBotId({ protect })`, as must `/api/sample/areas` and `/api/sample/rates`, because Biteship bills every search and quote.

## Batches (`SampleBatchService`)

- Batches are always numbered: the next is `Batch NN` / `bNN` (`Batch 100` / `b100` after 99). A founder only chooses capacity (1 to 10 000). The id is permanent: it is in box labels (`B02-042`), Midtrans order ids, Biteship references and the Shopify tag `sampling-b02`.
- Each batch has a phase. At most one is `open`, enforced in `setPhase` ("Close Batch 01 first.") and by the partial unique index `sample_batches_one_open`. A new batch starts `upcoming`.
- `closed` is final: `setPhase` refuses to move a closed batch anywhere else, and `setCapacity` refuses a closed batch. `remove` deletes only a batch with no requests at all (expired included) that is not open; anything with requests is closed instead. New batch is refused while one is open.
- `/sample` serves the open batch (its form, or its claimed notice once full); with none open, the newest `upcoming` batch's coming-soon page; otherwise the newest batch's claimed notice. Every visitor line that names the batch or its size comes from `batchCopy()` in `sample-copy.ts`; never hard-code "Batch 01" or "100".
- One email, one sample: an email with a paid, shipped or delivered request in any batch is refused (`already-requested`, and the paid email for that request is resent naming its own batch). A live unpaid hold in any batch is expired by a new claim.

## Admin

- The batch an admin page shows is in its URL (`/admin/batches/b02/...`); the sidebar has one section per batch, and the open batch plus the one you are in show their Requests and Export. Old batch-less links land on the open batch, else the newest (`defaultAdminBatch`).
- Exports are one batch per file: `within-<id>-registrations.csv` and `within-<id>-feedback.csv`.
- Delivery tracking (`SampleDeliveryService.board`) reads each shipped box's latest Biteship attempt. Failed is `ShipmentPhase.Attention`; stuck is picked up or in transit with no courier scan for `STUCK_AFTER_DAYS` (5). The reason shown is the courier's latest non-empty history note. Feedback rate is check-ins over delivered boxes.
- UI rules for admin are in [transparency-lab.md](transparency-lab.md).
