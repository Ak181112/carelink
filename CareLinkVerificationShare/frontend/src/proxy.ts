import { NextRequest, NextResponse } from "next/server";

type Role = "family_member" | "caretaker" | "admin";

// Every protected area, and the roles allowed inside it. Order matters:
// the first prefix that matches the pathname decides.
const PROTECTED_AREAS: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/caretaker", roles: ["caretaker"] },
  { prefix: "/client", roles: ["family_member"] },
  { prefix: "/parents", roles: ["family_member"] },
  { prefix: "/bookings", roles: ["family_member"] },
  { prefix: "/payment", roles: ["family_member"] },
  { prefix: "/feedback", roles: ["family_member"] },
  { prefix: "/caretakers", roles: ["family_member"] },
  { prefix: "/profile", roles: ["family_member", "caretaker", "admin"] },
  { prefix: "/notifications", roles: ["family_member", "caretaker", "admin"] },
  { prefix: "/settings", roles: ["family_member", "caretaker", "admin"] },
];

// Where each role belongs when it lands somewhere it is not allowed
const HOME_FOR_ROLE: Record<Role, string> = {
  admin: "/admin",
  caretaker: "/caretaker",
  family_member: "/client/dashboard",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const area = PROTECTED_AREAS.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!area) return NextResponse.next();

  const token = request.cookies.get("carelink_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // The JWT payload only carries the user id, so the role is mirrored into its
  // own cookie at login. This is an optimistic UX guard only -- every API route
  // re-checks the role server-side against the verified token.
  const role = request.cookies.get("carelink_role")?.value as Role | undefined;

  if (!role) return NextResponse.next();

  if (!area.roles.includes(role)) {
    return NextResponse.redirect(new URL(HOME_FOR_ROLE[role] ?? "/login", request.url));
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
    "/caretakers/:path*",
  ],
};
