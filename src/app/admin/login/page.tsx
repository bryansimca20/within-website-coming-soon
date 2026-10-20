import { WithinLogo } from "@/components/brand/WithinLogo";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

/** Founder sign-in. */
export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-6">
      <WithinLogo kind="logotype" height={20} />
      <AdminLoginForm />
    </main>
  );
}
