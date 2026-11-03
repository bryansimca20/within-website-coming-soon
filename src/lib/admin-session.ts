import "server-only";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requireEnv } from "./env";

/** Cookie name the proxy checks for presence before any admin page renders. */
export const ADMIN_COOKIE = "within_admin";

interface IAdminSessionData {
  isAdmin?: true;
}

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

/** The signed founder session. One shared passcode, no user rows. */
export async function getAdminSession() {
  return getIronSession<IAdminSessionData>(await cookies(), {
    password: requireEnv("SESSION_SECRET"),
    cookieName: ADMIN_COOKIE,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: THIRTY_DAYS_SECONDS,
    },
  });
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminSession()).isAdmin === true;
}

/** Every admin page and action calls this first; the proxy's cookie check is only a shortcut. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}
