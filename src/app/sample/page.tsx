import { SamplePage } from "@/components/sample/SamplePage";
import { db } from "@/db/client";
import { MidtransService } from "@/services/midtrans.service";
import { SampleRequestService } from "@/services/sample-request.service";

export const dynamic = "force-dynamic";

/** `/sample`: reads the batch on every request, so the admin "Taking requests" switch applies at once. */
export default async function SampleRoute() {
  const state = await SampleRequestService.pageState(db, new Date());

  return <SamplePage state={state} snapScriptUrl={MidtransService.snapScriptUrl(MidtransService.environment())} />;
}
