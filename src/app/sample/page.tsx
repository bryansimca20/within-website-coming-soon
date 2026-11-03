import type { Metadata } from "next";

import { SamplePage } from "@/components/sample/SamplePage";
import { batchCopy } from "@/components/sample/utils/sample-copy";
import { db } from "@/db/client";
import { MidtransService } from "@/services/midtrans.service";
import { SampleRequestService } from "@/services/sample-request.service";

export const dynamic = "force-dynamic";

/** The tab title names the batch /sample is serving. */
export async function generateMetadata(): Promise<Metadata> {
  const state = await SampleRequestService.pageState(db, new Date());

  return { title: state.kind === "none" ? "Samples" : batchCopy(state.batch).pageTitle };
}

/** `/sample`: reads the batch on every request, so changes in admin apply at once. */
export default async function SampleRoute() {
  const state = await SampleRequestService.pageState(db, new Date());

  return <SamplePage state={state} snapScriptUrl={MidtransService.snapScriptUrl(MidtransService.environment())} />;
}
