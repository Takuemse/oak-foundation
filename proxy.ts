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

  const isProtectedAdminPath =
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login") &&
    !request.nextUrl.pathname.startsWith("/admin/check-in") &&
    !request.nextUrl.pathname.startsWith("/admin/attendance");

  if (isProtectedAdminPath && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const isProgrammeGatedPath = PROGRAMME_GATED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (isProgrammeGatedPath) {
    const sessionCookie = request.cookies.get("oak_session")?.value;
    const session = await verifySessionToken(sessionCookie);
    const allowed = !!session && PROGRAMME_ROLES.includes(session.role);

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