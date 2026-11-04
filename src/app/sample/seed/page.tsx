import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SampleSeedForm } from "@/components/sample/SampleSeedForm";
import { SampleShell } from "@/components/sample/SampleShell";
import { isAdmin } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Register samples", robots: { index: false } };

/** `/sample/seed`: founders register in-person samples from a signed-in phone. Anyone else lands on /sample. */
export default async function SampleSeedRoute() {
  if (!(await isAdmin())) redirect("/sample");

  return (
    <SampleShell>
      <SampleSeedForm />
    </SampleShell>
  );
}
