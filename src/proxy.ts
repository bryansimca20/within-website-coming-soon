import { type NextRequest, NextResponse } from "next/server";

/** Cookie presence only. The signature and value are checked by `requireAdmin` on every page and action. */
const ADMIN_COOKIE = "within_admin";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || request.cookies.has(ADMIN_COOKIE)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*"],
};
