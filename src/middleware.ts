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

  // /dashboard, /diagnostic, /ai-tutor — students only
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/diagnostic") || pathname.startsWith("/ai-tutor")) {
    if (!session || session.role !== "student") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("role", "student");
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/diagnostic", "/ai-tutor"],
};
