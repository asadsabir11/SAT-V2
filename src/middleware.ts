import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sat_auth")?.value;
  const session = token ? await verifyToken(token) : null;

  // /admin — founder or teacher (a handful of sub-pages are founder-only, see below)
  if (pathname.startsWith("/admin")) {
    // Staff accounts can be deleted from the admin panel while the person is
    // still signed in elsewhere — re-check they still exist so a deleted
    // teacher/founder gets bounced to login on their very next navigation
    // instead of staying "logged in" until the JWT expires.
    const stillExists = session && (session.role === "founder" || session.role === "teacher")
      ? (await sql`SELECT id FROM users WHERE id = ${session.id} AND role = ${session.role}`).length > 0
      : false;
    if (!session || (session.role !== "founder" && session.role !== "teacher") || !stillExists) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("role", "founder");
      url.searchParams.set("next", pathname);
      const res = NextResponse.redirect(url);
      if (session) res.cookies.delete("sat_auth");
      return res;
    }
    // Founder-only areas: access/payment gatekeeping, parent accounts, teacher
    // accounts, and diagnostic quiz management — teachers get everything else.
    const FOUNDER_ONLY_PREFIXES = ["/admin/access", "/admin/o-level-access", "/admin/o-level-applications", "/admin/parents", "/admin/o-level-parents", "/admin/teachers", "/admin/quiz", "/admin/scholarships"];
    if (session.role === "teacher" && FOUNDER_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  // /dashboard, /sat, /diagnostic, /ai-tutor, /lectures, /sessions, /quizzes, /unlock, /fees, /o-level/lectures, /o-level/quizzes, /o-level/sessions, /o-level/past-papers, /o-level/unlock — students only
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/sat") || pathname.startsWith("/diagnostic") || pathname.startsWith("/ai-tutor") || pathname.startsWith("/lectures") || pathname.startsWith("/sessions") || pathname.startsWith("/quizzes") || pathname.startsWith("/unlock") || pathname.startsWith("/fees") || pathname.startsWith("/o-level/lectures") || pathname.startsWith("/o-level/quizzes") || pathname.startsWith("/o-level/sessions") || pathname.startsWith("/o-level/past-papers") || pathname.startsWith("/o-level/unlock")) {
    // A deleted student can otherwise stay "logged in" for up to 7 days —
    // the JWT alone doesn't know their account was removed.
    const stillExists = session && session.role === "student"
      ? (await sql`SELECT id FROM users WHERE id = ${session.id} AND role = 'student'`).length > 0
      : false;
    if (!session || session.role !== "student" || !stillExists) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("role", "student");
      url.searchParams.set("next", pathname);
      const res = NextResponse.redirect(url);
      if (session) res.cookies.delete("sat_auth");
      return res;
    }
  }

  // /discussion — any logged-in user (students AND founders can access)
  if (pathname.startsWith("/discussion")) {
    const stillExists = session
      ? (await sql`SELECT id FROM users WHERE id = ${session.id} AND role = ${session.role}`).length > 0
      : false;
    if (!session || !stillExists) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      const res = NextResponse.redirect(url);
      if (session) res.cookies.delete("sat_auth");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sat", "/admin/:path*", "/diagnostic", "/ai-tutor", "/lectures", "/lectures/:path*", "/sessions", "/sessions/:path*", "/quizzes", "/quizzes/:path*", "/discussion", "/discussion/:path*", "/unlock", "/unlock/:path*", "/fees", "/fees/:path*", "/o-level/lectures", "/o-level/lectures/:path*", "/o-level/quizzes", "/o-level/quizzes/:path*", "/o-level/sessions", "/o-level/sessions/:path*", "/o-level/past-papers", "/o-level/past-papers/:path*", "/o-level/unlock", "/o-level/unlock/:path*"],
};
