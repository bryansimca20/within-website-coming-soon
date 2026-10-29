import { redirect } from "next/navigation";

/** Old dashboard link: requests live on `/admin/requests` now. */
export default function AdminSampleRedirect() {
  redirect("/admin/requests");
}
