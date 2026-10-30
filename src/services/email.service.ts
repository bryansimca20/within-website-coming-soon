import "server-only";

import { requireEnv } from "@/lib/env";

/** One outbound email. */
export interface IEmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** A hung provider must not hang a visitor or a webhook. */
const REQUEST_TIMEOUT_MS = 8_000;

const RESEND_URL = "https://api.resend.com/emails";

/** Sends through Resend. A failure is logged and reported as false; it never throws into a webhook. */
export class EmailService {
  static async send(message: IEmailMessage): Promise<boolean> {
    const replyTo = process.env.SAMPLE_EMAIL_REPLY_TO ?? "";

    try {
      const response = await fetch(RESEND_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${requireEnv("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: requireEnv("SAMPLE_EMAIL_FROM"),
          to: [message.to],
          ...(replyTo === "" ? {} : { reply_to: replyTo }),
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        console.error("[email] send failed", response.status, await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error("[email] send threw", error);
      return false;
    }
  }
}
