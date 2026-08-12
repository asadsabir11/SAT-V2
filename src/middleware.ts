import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sat_auth")?.value;
  const session = token ? await verifyToken(token) : null;

  // /admin — founder only
  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "founder") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("role", "founder");
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // /dashboard, /diagnostic, /ai-tutor, /lectures, /sessions, /o-level/lectures, /o-level/quizzes — students only
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/diagnostic") || pathname.startsWith("/ai-tutor") || pathname.startsWith("/lectures") || pathname.startsWith("/sessions") || pathname.startsWith("/o-level/lectures") || pathname.startsWith("/o-level/quizzes")) {
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
  matcher: ["/dashboard/:path*", "/admin/:path*", "/diagnostic", "/ai-tutor", "/lectures", "/lectures/:path*", "/sessions", "/sessions/:path*", "/discussion", "/discussion/:path*", "/o-level/lectures", "/o-level/lectures/:path*", "/o-level/quizzes", "/o-level/quizzes/:path*"],
};
