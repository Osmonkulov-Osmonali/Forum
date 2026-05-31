import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

/**
 * Route protection rules:
 *  - /admin/login          → always public
 *  - /api/admin/login      → always public (sets the session cookie)
 *  - /api/admin/logout     → always public (clears the cookie)
 *  - GET /api/speakers     → public (landing page reads speakers)
 *  - everything else       → requires valid admin_session cookie
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Always-public paths ──────────────────────────────────────────────────────
  if (
    pathname === "/admin/login"     ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  ) {
    return NextResponse.next();
  }

  // Public read for the landing page speakers section
  if (req.method === "GET" && pathname === "/api/speakers") {
    return NextResponse.next();
  }

  // ── Verify session ───────────────────────────────────────────────────────────
  const token  = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  const secret = process.env.ADMIN_PASSWORD ?? "";
  const valid  = token ? await verifySessionToken(token, secret) : false;

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/speakers/:path*",
    "/api/upload",
    "/api/admin/:path*",
  ],
};
