import { db } from "@/db/client";
import { sampleBatches } from "@/db/schema";
import { SampleFeedbackService } from "@/services/sample-feedback.service";
import { SampleNotifier } from "@/services/sample-notifier.service";

export const dynamic = "force-dynamic";

/**
 * Daily (vercel.json): emails the check-in reminder to samplers delivered 7+ days ago with no check-in.
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; anything else is refused.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret === undefined || secret === "" || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = await SampleFeedbackService.dueReminders(db, now);
  const batches = new Map((await db.select().from(sampleBatches)).map((batch) => [batch.id, batch]));
  let sent = 0;
  for (const sampleRequest of due) {
    const batch = batches.get(sampleRequest.batchId);
    if (batch === undefined) continue;
    if (await SampleNotifier.sendFeedbackReminder(sampleRequest, batch)) {
      await SampleFeedbackService.markReminderSent(db, sampleRequest.id, now);
      sent += 1;
    }
  }

  return Response.json({ due: due.length, sent });
}
