import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/today", "/week", "/insights", "/profile", "/admin"];
const AUTH_PAGES = ["/sign-in"];

/**
 * Demo mode: the app mints its own cookie on first visit, so there is no redirect loop.
 * Supabase mode: @supabase/ssr refreshes the session cookie here. Route protection is also
 * enforced server-side in each page's getSession() check, so this is a fast path, not the wall.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  let response = NextResponse.next({ request });

  if (hasSupabase) {
    const { createServerClient } = await import("@supabase/ssr");
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      },
    );
    const { data } = await supabase.auth.getUser();
    const signedIn = Boolean(data.user);

    if (!signedIn && PROTECTED.some((p) => pathname.startsWith(p))) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (signedIn && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
      const url = request.nextUrl.clone();
      url.pathname = "/today";
      return NextResponse.redirect(url);
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
