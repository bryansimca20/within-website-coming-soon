import { SamplePage } from "@/components/sample/SamplePage";
import { db } from "@/db/client";
import { MidtransService } from "@/services/midtrans.service";
import { SampleRequestService } from "@/services/sample-request.service";

export const dynamic = "force-dynamic";

/** `/sample`: reads the open batch and its live count on every request. */
export default async function SampleRoute() {
  const batch = await SampleRequestService.getOpenBatch(db);
  const claimed = batch === null ? null : await SampleRequestService.countClaimed(db, batch.id, new Date());

  return (
    <SamplePage
      claimed={claimed}
      capacity={batch?.capacity ?? 100}
      snapScriptUrl={MidtransService.snapScriptUrl(MidtransService.environment())}
    />
  );
}
