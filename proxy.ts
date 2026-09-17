import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/app/lib/session";

const PROGRAMME_ROLES = ["OAK Staff", "Presenter", "Observer", "Coordination Team"];
const PROGRAMME_GATED_PREFIXES = [
  "/programme",
  "/partners",
  "/documentation",
  "/api/programme",
  "/api/partners",
  "/api/documentation",
];

// Public, unauthenticated admin-adjacent paths: signing in and resetting a
// password must obviously stay reachable without already being logged in.
const ADMIN_PUBLIC_PREFIXES = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Every /admin/* route now requires a real, signed-in Supabase Auth user
  // (an admin_users row) — including /admin/check-in and /admin/attendance.
  //
  // This used to exclude check-in and attendance so self-registered
  // "Coordination Team" attendees (identified only by the lightweight
  // oak_session cookie) could reach them directly. That contradicted the
  // database layer, where check_in_attendee() and get_attendance_summary()
  // both require is_admin() = true (a real auth.uid() in admin_users) — so
  // self-registered Coordination Team members could never actually
  // successfully check anyone in or view attendance; every call silently
  // failed authorization. It also contradicted the sprint brief directly:
  // "No attendee accounts or logins... Only the coordination team logs in
  // (admin)." Coordination Team access is now provisioned as a real admin
  // account (role='admin' in admin_users) rather than self-registered.
  const isPublicAdminPath = ADMIN_PUBLIC_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );
  const isAdminPath =
    request.nextUrl.pathname.startsWith("/admin") && !isPublicAdminPath;
  const isAdminApiPath =
    request.nextUrl.pathname.startsWith("/api/admin") ||
    request.nextUrl.pathname.startsWith("/api/check-in") ||
    request.nextUrl.pathname.startsWith("/api/attendance");

  if ((isAdminPath || isAdminApiPath) && !user) {
    if (
      request.nextUrl.pathname.startsWith("/api/") ||
      isAdminApiPath
    ) {
      return NextResponse.json(
        { success: false, message: "Not authorized." },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const isProgrammeGatedPath = PROGRAMME_GATED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (isProgrammeGatedPath) {
    const sessionCookie = request.cookies.get("oak_session")?.value;
    const session = await verifySessionToken(sessionCookie);
    const hasAttendeeAccess = !!session && PROGRAMME_ROLES.includes(session.role);
    // A real logged-in admin (Coordination Team or Lead Organizer) also
    // needs the Programme and Partners pages — they no longer carry an
    // oak_session cookie now that Coordination Team authenticates via
    // Supabase Auth instead of self-registration (see the isAdminPath
    // block above).
    const allowed = hasAttendeeAccess || !!user;

    if (!allowed) {
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, message: "Not authorized." },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/register", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};