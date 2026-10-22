import { SITE_URL } from "@/lib/site";

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
  boxWord: string;
  batchLabel: string;
  statusUrl: string;
  feedbackUrl: string;
  courier: {
    name: string;
    service: string;
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

function fill(template: string, context: ISampleEmailContext): string {
  return template.replace("{box}", context.boxWord).replace("{batch}", context.batchLabel);
}

interface IEmailBlock {
  kind: "paragraph" | "link" | "button";
  text: string;
  href?: string;
}

const INK = "#191919";
const MUTED = "#6b6b6b";
const ORANGE = "#ff8326";

function renderHtml(subject: string, context: ISampleEmailContext, blocks: IEmailBlock[]): string {
  const body = blocks
    .map((block) => {
      if (block.kind === "paragraph") {
        return `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:${INK}">${escapeHtml(block.text)}</p>`;
      }
      const href = escapeHtml(block.href ?? "");
      if (block.kind === "button") {
        return `<p style="margin:8px 0 24px"><a href="${href}" style="display:inline-block;background:${ORANGE};color:${INK};text-decoration:none;font-weight:600;font-size:16px;line-height:24px;padding:14px 24px">${escapeHtml(block.text)}</a></p>`;
      }
      return `<p style="margin:0 0 16px;font-size:14px;line-height:20px;color:${MUTED}">${escapeHtml(block.text)}<br><a href="${href}" style="color:${INK}">${href}</a></p>`;
    })
    .join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head><body style="margin:0;padding:0;background:#ffffff"><div style="max-width:520px;margin:0 auto;padding:32px 20px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${INK}"><p style="margin:0 0 28px"><img src="${escapeHtml(`${SITE_URL}/brand/within-logotype.png`)}" alt="WITHIN" height="18" style="height:18px;width:auto;display:block"></p><p style="margin:0 0 16px;font-size:16px;line-height:24px">${escapeHtml(context.firstName)},</p>${body}<p style="margin:28px 0 0;font-size:12px;line-height:16px;letter-spacing:0.06em;color:${MUTED}">${escapeHtml(SAMPLE_EMAIL_COPY.signature)}</p></div></body></html>`;
}

function renderText(context: ISampleEmailContext, blocks: IEmailBlock[]): string {
  const lines = blocks.map((block) => (block.href === undefined ? block.text : `${block.text}\n${block.href}`));

  return [`${context.firstName},`, ...lines, SAMPLE_EMAIL_COPY.signature].join("\n\n");
}

function blocksFor(kind: SampleEmailKind, context: ISampleEmailContext): IEmailBlock[] {
  const copy = SAMPLE_EMAIL_COPY;
  const statusLink: IEmailBlock = { kind: "link", text: copy.statusLabel, href: context.statusUrl };

  if (kind === SampleEmailKind.Paid) {
    return [...copy.paid.paragraphs.map((text) => ({ kind: "paragraph" as const, text })), statusLink];
  }

  if (kind === SampleEmailKind.Shipped) {
    const courier = context.courier;
    const courierLine =
      courier === null
        ? null
        : (courier.waybillId === null ? copy.shipped.courierWithoutWaybill : copy.shipped.courierWithWaybill)
            .replace("{courier}", courier.name)
            .replace("{service}", courier.service)
            .replace("{waybill}", courier.waybillId ?? "");
    const blocks: IEmailBlock[] = [{ kind: "paragraph", text: copy.shipped.intro }];
    if (courierLine !== null) {
      blocks.push({ kind: "paragraph", text: courierLine });
    }
    if (courier?.trackingLink) {
      blocks.push({ kind: "link", text: copy.shipped.trackLabel, href: courier.trackingLink });
    }
    blocks.push({ kind: "paragraph", text: copy.shipped.tip }, statusLink);
    return blocks;
  }

  if (kind === SampleEmailKind.Delivered) {
    return [
      ...copy.delivered.paragraphs.map((text) => ({ kind: "paragraph" as const, text })),
      { kind: "button", text: copy.delivered.button, href: context.feedbackUrl },
      { kind: "paragraph", text: copy.rewardLine },
    ];
  }

  if (kind === SampleEmailKind.FeedbackReminder) {
    return [
      ...copy.feedbackReminder.paragraphs.map((text) => ({ kind: "paragraph" as const, text })),
      { kind: "button", text: copy.feedbackReminder.button, href: context.feedbackUrl },
      { kind: "paragraph", text: copy.rewardLine },
    ];
  }

  return [
    { kind: "paragraph", text: copy.feedbackReceived.paragraphs[0] },
    { kind: "paragraph", text: copy.rewardLine },
    { kind: "paragraph", text: copy.feedbackReceived.paragraphs[1] },
  ];
}

const SUBJECT: Record<SampleEmailKind, string> = {
  [SampleEmailKind.Paid]: SAMPLE_EMAIL_COPY.paid.subject,
  [SampleEmailKind.Shipped]: SAMPLE_EMAIL_COPY.shipped.subject,
  [SampleEmailKind.Delivered]: SAMPLE_EMAIL_COPY.delivered.subject,
  [SampleEmailKind.FeedbackReceived]: SAMPLE_EMAIL_COPY.feedbackReceived.subject,
  [SampleEmailKind.FeedbackReminder]: SAMPLE_EMAIL_COPY.feedbackReminder.subject,
};

/** Renders one of the four emails for a sampler. Pure: no sending, no database. */
export function renderSampleEmail(kind: SampleEmailKind, context: ISampleEmailContext): IRenderedEmail {
  const subject = fill(SUBJECT[kind], context);
  const blocks = blocksFor(kind, context);

  return { subject, html: renderHtml(subject, context, blocks), text: renderText(context, blocks) };
}
