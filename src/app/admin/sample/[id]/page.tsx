import { redirect } from "next/navigation";

/** Old request link: the detail page lives on `/admin/requests/[id]` now. */
export default async function AdminSampleDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/requests/${encodeURIComponent(id)}`);
}
