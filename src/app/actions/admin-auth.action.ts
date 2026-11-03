"use server";

import { timingSafeEqual } from "node:crypto";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { AdminLoginState } from "@/app/utils/admin-state";
import { getAdminSession } from "@/lib/admin-session";
import { requireEnv } from "@/lib/env";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

const allow = createRateLimiter({ windowMs: 10 * 60_000, maxAttempts: 10 });

function passcodeMatches(candidate: string, expected: string): boolean {
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

/** Founder login with the shared passcode. */
export async function adminLoginAction(_previous: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  if (!allow(clientKey(await headers()))) {
    return { error: "rate" };
  }
  const passcode = formData.get("passcode");
  if (typeof passcode !== "string" || !passcodeMatches(passcode, requireEnv("ADMIN_PASSCODE"))) {
    return { error: "wrong" };
  }

  const session = await getAdminSession();
  session.isAdmin = true;
  await session.save();
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  const session = await getAdminSession();
  session.destroy();
  redirect("/admin/login");
}
