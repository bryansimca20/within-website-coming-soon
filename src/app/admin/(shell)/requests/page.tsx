import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { defaultAdminBatch } from "@/lib/admin-batch";

export const dynamic = "force-dynamic";

/** Old link from before batches had their own URLs: the open batch's requests, else the overview. */
export default async function AdminRequestsRedirect() {
  const batch = await defaultAdminBatch(db);
  redirect(batch === null ? "/admin" : `/admin/batches/${batch.id}/requests`);
}
