import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { SampleStatusPage } from "@/components/sample/SampleStatusPage";
import { db } from "@/db/client";
import { sampleBatches } from "@/db/schema";
import { MidtransService } from "@/services/midtrans.service";
import { SampleFeedbackService } from "@/services/sample-feedback.service";
import { SamplePaymentService } from "@/services/sample-payment.service";
import { SampleRequestService } from "@/services/sample-request.service";
import { SampleShipmentService } from "@/services/sample-shipment.service";

export const dynamic = "force-dynamic";

const TOKEN_PATTERN = /^[A-Za-z0-9]{24}$/;

/** The sampler's private status page, linked from every email. */
export default async function SampleStatusRoute({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!TOKEN_PATTERN.test(token)) notFound();

  const found = await SampleRequestService.findByToken(db, token);
  if (found === null) notFound();

  const now = new Date();
  const request = await SampleRequestService.markExpiredIfLapsed(db, found, now);
  const [batch] = await db.select().from(sampleBatches).where(eq(sampleBatches.id, request.batchId)).limit(1);
  const [payment, shipment, feedback] = await Promise.all([
    SamplePaymentService.latestForRequest(db, request.id),
    SampleShipmentService.latestForRequest(db, request.id),
    SampleFeedbackService.forRequest(db, request.id),
  ]);

  return (
    <SampleStatusPage
      request={request}
      boxWord={SampleRequestService.boxWord(request.boxNumber)}
      batchLabel={batch?.label ?? ""}
      minutesLeft={SampleRequestService.minutesLeft(request, now)}
      payment={payment}
      shipment={shipment}
      feedback={feedback}
      snapScriptUrl={MidtransService.snapScriptUrl(MidtransService.environment())}
    />
  );
}
