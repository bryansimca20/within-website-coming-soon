# Environment

Secrets live in `.env.local` (gitignored) locally and in Vercel project settings for Production + Preview. Adding a key means mirroring it here and raising it with the founder first.

| Key | Purpose |
| --- | --- |
| `SHOPIFY_STORE_DOMAIN` | `xxx.myshopify.com`. Which store signups are written to |
| `SHOPIFY_CLIENT_ID` | Dev Dashboard app Client ID, **`write_customers` scope only** |
| `SHOPIFY_CLIENT_SECRET` | `shpss_…` Client Secret. Exchanged for a 24h Admin API token at request time |
| `DATABASE_URL` | Neon Postgres for the sampling tables. Previews get their own Neon branch |
| `SESSION_SECRET` | iron-session secret for the founder admin cookie, 32+ chars |
| `ADMIN_PASSCODE` | Shared founder passcode for `/admin/login` |
| `MIDTRANS_SERVER_KEY` | Snap transactions and notification signature checks |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Public by design: snap.js `data-client-key` |
| `NEXT_PUBLIC_MIDTRANS_ENV` | `sandbox` or `production`; picks both Midtrans hosts |
| `BITESHIP_API_KEY` | Area search, rates, orders |
| `BITESHIP_WEBHOOK_TOKEN` | Secret `?token=` on the Biteship webhook URL (Biteship signs nothing) |
| `SAMPLE_ORIGIN_CONTACT_NAME`, `_PHONE`, `_ADDRESS`, `_AREA_ID`, `_POSTAL_CODE`, `_NOTE` | The BSD office as Biteship origin (all prefixed `SAMPLE_ORIGIN_`) |
| `RESEND_API_KEY`, `SAMPLE_EMAIL_FROM`, `SAMPLE_EMAIL_REPLY_TO` | Sampler emails through Resend |
| `CRON_SECRET` | Vercel Cron sends it as `Authorization: Bearer …`; `/api/cron/feedback-reminders` refuses anything else |

## Site URL

Every absolute URL the site emits (metadata, emails, the Snap finish callback) is built from `SITE_URL` in [site.ts](../src/lib/site.ts), which follows the deployment: `https://www.getwithin.id` in production, the branch host on a Vercel preview, localhost in dev.

Set `NEXT_PUBLIC_SITE_URL` only for a custom staging domain, scoped to that environment and never to Production + Preview together. It is not needed otherwise. The card's QR and the Midtrans and Biteship webhook URLs are fixed outside the code.

## Shopify

- The app lives in the **Dev Dashboard** (`dev.shopify.com/dashboard`): scope `write_customers`, Release the version, Install on the store. In-admin custom apps and static `shpat_` tokens are gone.
- The service exchanges Client ID + Secret for a short-lived token via `POST /admin/oauth/access_token` (`grant_type=client_credentials`) on each write, so there is no static token to store or rotate.
- Never prefix these keys with `NEXT_PUBLIC_`. [shopify-customer.service.ts](../src/services/shopify-customer.service.ts) imports `server-only`, so importing it from a client component is a build error rather than a leaked secret.
- The Admin API version is a code constant in that service, not an environment variable.
- Shopify needs a customer metafield definition (`custom.instagram_handle`, single line text). Without it the value still writes but stays invisible in the admin UI.

## Vercel

- Web Analytics must be enabled on the project. Nothing is sent in local dev.
- `next.config.ts` is wrapped in `withBotId()`. Locally `checkBotId()` always returns `isBot: false`.
