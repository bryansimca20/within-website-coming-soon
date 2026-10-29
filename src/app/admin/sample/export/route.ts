import { redirect } from "next/navigation";

/** Old export link: the exports live on `/admin/export` now, one file each for registrations and feedback. */
export async function GET() {
  redirect("/admin/export");
}
