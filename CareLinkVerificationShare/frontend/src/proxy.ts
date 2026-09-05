import { NextRequest, NextResponse } from "next/server";

const clientProtectedRoutes = ["/client", "/profile", "/parents", "/bookings", "/notifications", "/settings", "/feedback", "/payment", "/caretakers"];
const caretakerProtectedRoutes = ["/caretaker"];
const adminProtectedRoutes = ["/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("carelink_token")?.value;

  const isClientRoute = clientProtectedRoutes.some((r) => pathname.startsWith(r));
  const isCaretakerRoute = caretakerProtectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = adminProtectedRoutes.some((r) => pathname.startsWith(r));

  if ((isClientRoute || isCaretakerRoute || isAdminRoute) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/client/:path*",
    "/caretaker/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/parents/:path*",
    "/bookings/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/feedback/:path*",
    "/payment/:path*",
  ],
};
