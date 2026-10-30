import { redirect } from "next/navigation";

/** Old Batches table: every batch is on the overview now. */
export default function AdminBatchesRedirect() {
  redirect("/admin");
}
