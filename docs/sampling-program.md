# Sampling Program

Samples go out in numbered batches (Batch 01 was 100 boxes of three sachets, free, the sampler pays the courier). Specs are local in `docs/superpowers/specs/` (gitignored): `2026-10-20-sampling-program-design.md` and `2026-10-28-sample-batches-and-admin-design.md`, `2026-11-03-sample-seeding-and-test-orders-design.md`. The bank-transfer spec is at the workspace root: `../docs/superpowers/specs/2026-11-23-sample-manual-bank-transfer-design.md`.

## Routes and flow

```
/sample (dynamic)                       SampleRequestForm, 5 steps, client-held values
  ├─ checkSampleEmailAction            step 1's Continue: refuses an email that already owns a box (fails open)
  ├─ GET  /api/sample/areas?q=          Biteship area search (rate-limited proxy)
  ├─ POST /api/sample/rates             live courier quotes, cheapest 4
  └─ requestSampleAction                BotID + honeypot + zod, then:
       ├─ SampleRequestService.claim    one transaction, batch row locked: a reported transfer from the
       │                                same email is returned untouched, lapsed holds expire,
       │                                same-email unpaid hold replaced, paid duplicate refused,
       │                                capacity checked, next box number taken, bank-transfer code issued
       ├─ Midtrans batch: SamplePaymentService.createAttempt   Midtrans Snap, expiry = minutes left in the hold
       ├─ Bank-transfer batch: payment-instructions email, then the form goes to the status page
       └─ Shopify customerCreate        tags prelaunch, coming-soon, sampling-<batch id>, ref-<slug>;
                                        SUBSCRIBED only if they ticked the optional launch email
/sample/r/[token]                       status page; Midtrans: "Pay now" = reopenPaymentAction;
                                        bank transfer: Pay (account, code), "I've transferred" =
                                        reportTransferAction, then Send proof (WhatsApp)
POST /api/webhooks/midtrans             signature checked, attempt updated, paid email once
admin "Book selected"                   SampleShipmentService.bookRun, one Biteship order each
POST /api/webhooks/biteship?token=      order re-fetched from Biteship, shipped/delivered email once
/sample/feedback[?code=]                QR landing; matched by token, else by email
/admin                                  overview: in transit, delivered, failed, feedback rate, failed and
                                        stuck deliveries with the courier's note, every batch side by side, New batch
/admin/reviews[?batch=&stars=]          review score: average stars, star split, taste, effectiveness, felt, each review
/admin/reviews/export/judgeme[?handle=] shareable reviews as a Judge.me import CSV
/admin/batches/[batchId]/requests       one batch: status, payment method, capacity, counts, Payments to confirm,
                                        search (box, name, email or payment code), ship runs
/admin/batches/[batchId]/export (+ /registrations, /feedback)  that batch's two CSVs
/admin/requests/[id]                    request detail, resends, reship, Mark as test / Unmark test
/sample/seed                            in-person seeding form (admin session or redirect to /sample)
  └─ seedSampleAction                   requireAdmin + honeypot + zod, then SampleRequestService.seed
/admin/seeded[?checkedIn=]              in-person recipients, summary, checked-in filter
/admin/seeded/export (+ /registrations, /feedback)  the seeded CSVs
```

## Payment methods: Midtrans or bank transfer

Each batch has a `payment_method` (`midtrans`, the default, or `bank_transfer`), chosen in its admin header. It decides only what a new claim gets; every request keeps its own method, read from the request: one with a `payment_code` is a bank transfer. The status page, Confirm, Reject, the resend buttons and `reopenPaymentAction` all branch on the request, never the batch. Bank transfer exists because Midtrans and Xendit approval stalled (2026-11-23); the Midtrans path is unchanged.

- **Switching** (`SampleBatchService.setPaymentMethod`, batch row locked): refused for a closed batch, and while the batch holds any unpaid live request (an unlapsed `pending_payment` or any `awaiting_confirmation`, test rows included; lapsed holds are expired first). Switching to bank transfer is also refused while any of the env vars `BANK_NAME`, `BANK_ACCOUNT_HOLDER`, `BANK_ACCOUNT_NUMBER` or `WHATSAPP_NUMBER` is empty in that deployment, so a deploy can never show placeholder bank details. They are read server-side by `readBankTransferDetails()` in `src/app/utils/bank-transfer.ts`, which also holds the 24-hour confirmation promise. Staging can use a test WhatsApp number; a change takes effect on the next deploy.
- **The code:** 6 characters from `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (no 0, O, 1, I), no dash, unique. One code does every job: the Berita Transfer note, the order id in the WhatsApp message, the admin search key (any case, spaces trimmed).
- **The flow:** the claim issues the code and the action emails the payment instructions (account, amount, code, hold deadline, status link). The status page shows a two-step bar. Pay lists the amount, the account and the code with copy buttons (the amount copies as digits). "I've transferred" (`SampleTransferService.report`) moves a live hold to `awaiting_confirmation` with `transfer_reported_at`. Repeat taps change nothing; a tap after the hold lapsed expires it instead. Send proof opens `wa.me` with the code, amount and name prefilled. The site cannot see WhatsApp, so a founder confirms against the bank's transaction list, never a screenshot.
- **`awaiting_confirmation`** holds the box until a founder decides, and never lapses: hold expiry only ever touches `pending_payment`. It counts toward capacity and blocks a method switch. A same-email claim returns it untouched instead of replacing it, and emails a short "we are checking your transfer" note in place of the instructions. Paying any request of that email (Confirm, or a Midtrans settlement) releases its other pending and reported requests; an email that already owns a box is told so before a reported transfer is looked up.
- **Confirm** (`SampleTransferService.confirm`, batch row locked, bank-transfer requests only) pays through `SampleRequestService.settle` and then `dispatchPaidEmail`, the Midtrans path, so Biteship booking and every later email work unchanged. It also works from `pending_payment` (money arrived, never tapped) and from `expired` (late money). A late transfer is paid only while the batch has room, not counting the same sampler's own newer holds, which paying releases. Otherwise, and for a rejected (`cancelled`) request, nothing is paid and the note gets `REFUND DUE: <code>`, written once. A closed batch still confirms.
- **Reject** (`pending_payment` or `awaiting_confirmation` only) cancels the request with `Transfer not found.` plus the founder's note, freeing the box. It is final: money that arrives after it is a refund. No email goes out on report or reject; the founder replies in the sampler's WhatsApp thread. The bank-transfer phone hint on the shipping step says so ("For the courier, and for us if we need to check your transfer.").
- **Admin:** a "Payments to confirm" card on the batch's Requests page lists reported transfers oldest first, flags any older than 24 hours as Overdue, and links each sampler's WhatsApp. The request detail page has Confirm and Reject too, and "Resend payment instructions", which goes only to an unpaid bank-transfer request. Refunds are manual bank transfers.

## Holds, webhooks and failures

- A request's 24-hour hold is ours; a Midtrans attempt lapsing (QRIS defaults to 15 minutes) ends only that attempt. `pending_payment` becomes `expired` lazily, whenever the count or a status page is read. The only cron is the check-in reminder.
- Webhook bodies are stored in `sample_webhook_events` before processing and answered 500 if processing fails, so the provider retries. Midtrans is trusted only after its SHA512 signature, and unsigned bodies are logged, not stored; Biteship bodies are never trusted, the order is re-fetched. A paid request is never moved backwards, and each once-only email has a guard column (`paid_email_sent_at`, `shipped_email_sent_at`, `delivered_email_sent_at`). The daily cron retries a failed paid email.
- The courier fee comes from the server's own Biteship quote, never from the form.
- A settlement on a cancelled request, or for an email that already owns a box, does not pay it: the request's admin note says `REFUND DUE` with the order id, for a founder to refund in Midtrans. Replacing a hold or cancelling a request also cancels its open Midtrans order.
- `MidtransService.createSnapTransaction`, `BiteshipService.createOrder` and `EmailService.send` never throw; they log and return null or false. A thrown error there once left unpaid holds occupying slots.

## Check-ins and reviews

- The check-in has two doors. The personal link (`?code=`, in the delivered and reminder emails and on the status page) identifies the sampler outright. The card's QR asks for the email first: it must belong to a shipped or delivered order with no check-in yet, or the form says why it can't go on. That does reveal whether an email claimed samples; the founder accepted it on 2026-10-22. Older unmatched rows are still listed in admin.
- The check-in is a review in four screens: stars + review + "Can we share your review?" (all required), headline (optional, skippable), taste + effectiveness (1 to 5), how they felt. The first screen saves the row (`submitFeedbackAction`); each later one adds to it by its id (`addToFeedbackAction`), only within two hours of the last save, so leaving early still leaves a review.
- Rows from the old six-question form keep `session_type`, `session_length`, `would_reach_again` and `comment`; new rows leave them null, so intent is empty for them.
- Publishing consent is `share_consent`: `yes` or `no` from the first screen's required choice (nothing pre-selected, decided 2026-11-25), or `notice` for reviews saved before the question, which were written under the old note "Reviews may appear on our website and Instagram". Null only on old six-question rows. The admin review list shows it.
- Nothing publishes reviews from this site. `/admin/reviews` exports them for Judge.me on the production Shopify store (`JudgeMeExportService`): consent `yes` or `notice`, matched to a non-test box that was shipped or delivered (seeded boxes count as delivered), with stars and text. Reviewer name is the first name; `curated` is `not-yet`, so each import waits in Judge.me's "To curate" queue for a claims check. Only Judge.me's own template import ("Judge.me format") reads `curated`; other import options may publish straight away, and the admin card says so. A product handle targets one product; blank imports store reviews. No BOM or formula prefix, since Judge.me would import them into the text. Judge.me has no disclosure field and never marks imports verified: the copy promises "noted as from a free sample", so the widget must say so.
- One check-in reminder goes out 7 days after delivery (seeded rows included, they are `delivered`), from the daily Vercel Cron in `vercel.json` (`/api/cron/feedback-reminders`, 02:00 UTC = 09:00 WIB). `feedback_reminder_sent_at` guards it. It carries five text stars (U+2606), each linking `?code=…&rating=N`, which pre-fills the stars. There is no thank-you email; the thank-you screen carries the Instagram follow.
- Review score (`summarizeReviews`) averages only rows with stars; old six-question check-ins have none but still count toward taste. Their `comment` shows as the review text.

## Copy, consent and routing

- Closed answer sets are stored as option keys from `src/app/utils/sample-options.ts`; labels live in `src/components/sample/utils/sample-copy.ts`; email copy in `src/services/sample-email-copy.ts`.
- `/sample*` runs the WITHIN brand system from `/` (and scrolls). `/admin` runs Transparency Lab tokens. Both are `noindex` and out of the sitemap.
- Step 1 has two required boxes, both unticked: "Email me when WITHIN launches." and "I promise to share my feedback after trying it." (founder decision, 2026-11-24; the in-person seeding form shares step 1, so it requires both too). The launch-email box is the only marketing consent a sampler gives: it sets `consented_at` and subscribes them in Shopify. Order emails (payment instructions for bank-transfer requests, paid, shipped, delivered, reminder) go to every sampler regardless. The payment-instructions email never repeats the typed name, since it goes out before anyone has paid.
- `/sample` and `/sample/feedback` must stay listed in `initBotId({ protect })`, as must `/api/sample/areas` and `/api/sample/rates`, because Biteship bills every search and quote.

## Batches (`SampleBatchService`)

- Batches are always numbered: the next is `Batch NN` / `bNN` (`Batch 100` / `b100` after 99). A founder only chooses capacity (1 to 10 000). The id is permanent: it is in box labels (`B02-042`), Midtrans order ids, Biteship references and the Shopify tag `sampling-b02`.
- Each batch has a phase. At most one is `open`, enforced in `setPhase` ("Close Batch 01 first.") and by the partial unique index `sample_batches_one_open`. A new batch starts `upcoming`, and so does the seeded Batch 01 on a fresh database (migration 0010), so deploying never opens the form.
- `closed` is final: `setPhase` refuses to move a closed batch anywhere else, and `setCapacity` refuses a closed batch. `remove` deletes only a batch with no requests at all (expired included) that is not open; anything with requests is closed instead. New batch is refused while one is open.
- `/sample` serves the open batch (its form, or its claimed notice once full); with none open, the newest `upcoming` batch's coming-soon page; otherwise the newest batch's claimed notice. Every visitor line that names the batch or its size comes from `batchCopy()` in `sample-copy.ts`; never hard-code "Batch 01" or "100".
- One email, one sample: step 1's Continue already stops an email that owns a box or reported a transfer (`SampleRequestService.hasClaim`, an inline error on the email field, no email resent, so a typed stranger's address never triggers mail). It fails open on a bot verdict, the rate limit or an error, and the claim is the real guard. At the claim, an email with a paid, shipped or delivered request in any batch, or an in-person one, is refused (`already-requested`, and the paid email for that request is resent naming its own batch). A live unpaid hold in any batch is expired by a new claim. Test and real requests are counted apart (see Test orders).

## Test orders

- `sample_requests.is_test`. Set automatically when `requestSampleAction` runs with a valid admin session (`isAdmin()`), or by hand with "Mark as test" / "Unmark test" on the request detail (`setTestRequestAction`) for a partner who was not logged in.
- The full real flow still runs: Midtrans, Biteship, emails, webhooks, check-in, reminder cron. The charge and the courier booking are real; refund in Midtrans.
- Excluded: batch capacity and the public claimed notice, one-email-one-sample against real requests (a test is blocked only by other tests, use `+alias` emails), overview, delivery board, review score, `/admin/reviews`, batch request counts, both CSV exports. A test still takes a box number, and still shows in the batch request list with a "Test" pill.
- Shopify `customerCreate` is skipped when flagged at claim. Flagging later undoes nothing; delete the customer by hand.

## In-person seeding

- An owner logged into admin opens `/sample/seed` ("Seed a sample" in the sidebar, which opens in a new tab so Back cannot reach admin) and hands over the phone. The page uses the WITHIN brand with no admin links, and redirects to `/sample` without an admin session. The recipient does the training steps, then name, email, WhatsApp, Instagram and the optional launch and share boxes. No address, courier or payment. "Seed another" resets the form; the session stays. The session is shared by all owners, so who handed a box out is not recorded.
- `seedSampleAction` needs `requireAdmin` (no BotID) and keeps the honeypot. `SampleRequestService.seed` writes a row with `source = in_person`, `status = delivered`, `delivered_at = now`, no batch, no box number, no payment or shipment rows. Batch, address and courier columns are nullable; a check constraint keeps them required when `source = shipped`.
- One email, one sample holds across sources. A live unpaid hold for the email is expired, as a new claim does.
- One "seeded" email goes out with the personal check-in link (`?code=`), no paid, shipped or delivered emails. The QR check-in and the 7-day reminder work as for any delivered row.
- Shopify customer tagged `prelaunch`, `coming-soon`, `sampling-in-person`; subscribed only if the launch box is ticked.
- `/admin/seeded` is its own sidebar section: name, Instagram (linked), WhatsApp, date, check-in status, stars, headline, and a checked-in filter; summary of seeded total, checked-in rate and average stars. Exports are `within-seeded-registrations.csv` and `within-seeded-feedback.csv`. `/admin/reviews` has a "Seeded" tab; the batch review score, overview and delivery board leave seeded rows out.

## Admin

- The batch an admin page shows is in its URL (`/admin/batches/b02/...`); the sidebar has one section per batch, and the open batch plus the one you are in show their Requests and Export.
- Exports are one batch per file: `within-<id>-registrations.csv` and `within-<id>-feedback.csv`. Registrations carry `payment_code` and `transfer_reported_at` right after `status` (empty for Midtrans rows).
- Delivery tracking (`SampleDeliveryService.board`) reads each paid, shipped or delivered box's latest Biteship attempt, so an order that fails before pickup still shows. Failed is `ShipmentPhase.Attention`, and such a box can be booked again; a live shipment cannot (`isBookable`, enforced in `bookRun`); stuck is picked up or in transit with no courier scan for `STUCK_AFTER_DAYS` (5). The reason shown is the courier's latest non-empty history note. Feedback rate is check-ins over delivered boxes.
- UI rules for admin are in [transparency-lab.md](transparency-lab.md).
