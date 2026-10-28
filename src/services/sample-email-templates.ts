import { INSTAGRAM_URL, SITE_URL } from "@/lib/site";

import { SAMPLE_EMAIL_COPY } from "./sample-email-copy";

/** The moments a sampler hears from WITHIN. */
export enum SampleEmailKind {
  Paid = "paid",
  Shipped = "shipped",
  Delivered = "delivered",
  FeedbackReceived = "feedback-received",
  FeedbackReminder = "feedback-reminder",
}

/** Everything a template needs; the notifier builds it from the request and shipment rows. */
export interface ISampleEmailContext {
  firstName: string;
  batchLabel: string;
  statusUrl: string;
  feedbackUrl: string;
  /** Set once a shipment exists. `name` is the courier service as the sampler chose it ("JNE Reguler"). */
  courier: {
    name: string;
    eta: string | null;
    waybillId: string | null;
    trackingLink: string | null;
  } | null;
}

/** A rendered email: subject plus html and plain-text bodies. */
export interface IRenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** Escapes the five characters that matter inside html text and attributes. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** One email in the shared "note" layout: label, headline, paragraphs, an optional waybill box, one button. */
interface INoteEmail {
  subject: string;
  preheader: string;
  headline: string;
  paragraphs: string[];
  waybill?: { label: string; value: string | null; pending: string };
  button: { label: string; href: string; isPrimary: boolean };
}

const INK = "#191919";
const MIST = "#f2f2f2";
const MUTED = "#6b6b6b";
const ORANGE = "#ff8326";
const LINE = "#dcdcdc";
const FONT = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "'SFMono-Regular',Menlo,Consolas,monospace";

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

function renderHtml(email: INoteEmail, batchLabel: string): string {
  const paragraphs = email.paragraphs
    .map((text) => `<p style="margin:0 0 16px;font-family:${FONT};font-size:17px;line-height:26px;color:${INK};">${escapeHtml(text)}</p>`)
    .join("");
  const waybill =
    email.waybill === undefined
      ? ""
      : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:${MIST};"><tr><td style="padding:14px 16px;">` +
        `<div style="font-family:${FONT};font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.06em;color:${MUTED};padding-bottom:4px;">${escapeHtml(email.waybill.label)}</div>` +
        (email.waybill.value === null
          ? `<div style="font-family:${FONT};font-size:15px;line-height:22px;color:${INK};">${escapeHtml(email.waybill.pending)}</div>`
          : `<div style="font-family:${MONO};font-size:18px;line-height:24px;font-weight:500;color:${INK};letter-spacing:0.02em;">${escapeHtml(email.waybill.value)}</div>`) +
        `</td></tr></table>`;
  const { button } = email;
  const buttonHtml =
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;"><tr><td style="background:${button.isPrimary ? ORANGE : INK};">` +
    `<a href="${escapeHtml(button.href)}" style="display:block;padding:16px 20px;font-family:${FONT};font-size:16px;line-height:20px;font-weight:600;color:${button.isPrimary ? INK : MIST};text-decoration:none;">` +
    `${escapeHtml(button.label)}<span style="float:right;">&rarr;</span></a></td></tr></table>`;
  const logo = escapeHtml(`${SITE_URL}/brand/within-logotype.png`);

  return (
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(email.subject)}</title></head>` +
    `<body style="margin:0;padding:0;background:${MIST};">` +
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(email.preheader)}</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${MIST};"><tr><td align="center" style="padding:24px 12px;">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-top:6px solid ${INK};"><tr><td style="padding:32px 28px 28px;">` +
    `<p style="margin:0 0 10px;font-family:${FONT};font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.06em;color:${MUTED};">${escapeHtml(`SAMPLE ${batchLabel}`.toUpperCase())}</p>` +
    `<h1 style="margin:0 0 20px;font-family:${FONT};font-size:30px;line-height:36px;font-weight:400;letter-spacing:-0.02em;color:${INK};">${escapeHtml(email.headline)}</h1>` +
    paragraphs + waybill + buttonHtml +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid ${LINE};"><tr>` +
    `<td style="padding-top:12px;"><img src="${logo}" alt="WITHIN" height="13" style="height:13px;width:auto;display:block;border:0;"></td>` +
    `<td align="right" style="padding-top:12px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.06em;color:${MUTED};">${escapeHtml(SAMPLE_EMAIL_COPY.place)}</td></tr></table>` +
    `</td></tr></table>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;"><tr><td style="padding:16px 28px;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">${escapeHtml(SAMPLE_EMAIL_COPY.footer)}</td></tr></table>` +
    `</td></tr></table></body></html>`
  );
}

function renderText(email: INoteEmail): string {
  const waybill =
    email.waybill === undefined ? [] : [email.waybill.value === null ? email.waybill.pending : `${email.waybill.label}: ${email.waybill.value}`];

  return [email.headline, ...email.paragraphs, ...waybill, `${email.button.label}: ${email.button.href}`, `WITHIN, ${SAMPLE_EMAIL_COPY.place}`, SAMPLE_EMAIL_COPY.footer].join("\n\n");
}

function shippedEmail(context: ISampleEmailContext, name: Record<string, string>): INoteEmail {
  const copy = SAMPLE_EMAIL_COPY.shipped;
  const { courier } = context;
  const values = { ...name, courier: courier?.name ?? "", eta: courier?.eta ?? "", waybill: courier?.waybillId ?? "" };
  const intro = courier === null ? copy.withoutCourier : courier.eta ? copy.withCourierAndEta : copy.withCourier;
  const preheader =
    courier === null ? copy.preheaderPlain : courier.waybillId ? copy.preheaderWithWaybill : courier.eta ? copy.preheaderWithEta : copy.preheaderPlain;

  return {
    subject: fill(copy.subject, values),
    preheader: fill(preheader, values),
    headline: fill(copy.headline, values),
    paragraphs: [fill(intro, values)],
    waybill:
      courier === null
        ? undefined
        : { label: `${courier.name} · ${copy.waybillLabel}`.toUpperCase(), value: courier.waybillId, pending: copy.waybillPending },
    // Without a tracking link yet, the status page is where the waybill and tracking show up.
    button: { label: copy.button, href: courier?.trackingLink ?? context.statusUrl, isPrimary: true },
  };
}

function noteFor(kind: SampleEmailKind, context: ISampleEmailContext): INoteEmail {
  const name = { name: context.firstName, batch: context.batchLabel };
  if (kind === SampleEmailKind.Shipped) {
    return shippedEmail(context, name);
  }

  const copy = {
    [SampleEmailKind.Paid]: SAMPLE_EMAIL_COPY.paid,
    [SampleEmailKind.Delivered]: SAMPLE_EMAIL_COPY.delivered,
    [SampleEmailKind.FeedbackReminder]: SAMPLE_EMAIL_COPY.feedbackReminder,
    [SampleEmailKind.FeedbackReceived]: SAMPLE_EMAIL_COPY.feedbackReceived,
  }[kind];
  const href = {
    [SampleEmailKind.Paid]: context.statusUrl,
    [SampleEmailKind.Delivered]: context.feedbackUrl,
    [SampleEmailKind.FeedbackReminder]: context.feedbackUrl,
    [SampleEmailKind.FeedbackReceived]: INSTAGRAM_URL,
  }[kind];

  return {
    subject: fill(copy.subject, name),
    preheader: fill(copy.preheader, name),
    headline: fill(copy.headline, name),
    paragraphs: copy.paragraphs.map((text) => fill(text, name)),
    // Following on Instagram is optional, so the thank-you email's button is ink, not the orange of a main action.
    button: { label: copy.button, href, isPrimary: kind !== SampleEmailKind.FeedbackReceived },
  };
}

/** Renders one of the five emails for a sampler. Pure: no sending, no database. */
export function renderSampleEmail(kind: SampleEmailKind, context: ISampleEmailContext): IRenderedEmail {
  const email = noteFor(kind, context);

  return { subject: email.subject, html: renderHtml(email, context.batchLabel), text: renderText(email) };
}
