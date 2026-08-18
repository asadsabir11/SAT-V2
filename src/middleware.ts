import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sat_auth")?.value;
  const session = token ? await verifyToken(token) : null;

  // /admin — founder or teacher (a handful of sub-pages are founder-only, see below)
  if (pathname.startsWith("/admin")) {
    if (!session || (session.role !== "founder" && session.role !== "teacher")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("role", "founder");
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    // Founder-only areas: access/payment gatekeeping, parent accounts, teacher
    // accounts, and diagnostic quiz management — teachers get everything else.
    const FOUNDER_ONLY_PREFIXES = ["/admin/access", "/admin/o-level-access", "/admin/o-level-applications", "/admin/parents", "/admin/teachers", "/admin/quiz"];
    if (session.role === "teacher" && FOUNDER_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  // /dashboard, /sat, /diagnostic, /ai-tutor, /lectures, /sessions, /quizzes, /unlock, /o-level/lectures, /o-level/quizzes, /o-level/sessions, /o-level/past-papers, /o-level/unlock — students only
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/sat") || pathname.startsWith("/diagnostic") || pathname.startsWith("/ai-tutor") || pathname.startsWith("/lectures") || pathname.startsWith("/sessions") || pathname.startsWith("/quizzes") || pathname.startsWith("/unlock") || pathname.startsWith("/o-level/lectures") || pathname.startsWith("/o-level/quizzes") || pathname.startsWith("/o-level/sessions") || pathname.startsWith("/o-level/past-papers") || pathname.startsWith("/o-level/unlock")) {
    if (!session || session.role !== "student") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("role", "student");
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // /discussion — any logged-in user (students AND founders can access)
  if (pathname.startsWith("/discussion")) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sat", "/admin/:path*", "/diagnostic", "/ai-tutor", "/lectures", "/lectures/:path*", "/sessions", "/sessions/:path*", "/quizzes", "/quizzes/:path*", "/discussion", "/discussion/:path*", "/unlock", "/unlock/:path*", "/o-level/lectures", "/o-level/lectures/:path*", "/o-level/quizzes", "/o-level/quizzes/:path*", "/o-level/sessions", "/o-level/sessions/:path*", "/o-level/past-papers", "/o-level/past-papers/:path*", "/o-level/unlock", "/o-level/unlock/:path*"],
};
