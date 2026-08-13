import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getLectureById } from "@/lib/lectures";
import { getStudentAccessLevel } from "@/lib/users";
import { getOLevelSubjectAccess } from "@/lib/olevelAccess";

export const runtime = "edge";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const lecture = await getLectureById(id);

  if (!lecture || !lecture.is_published) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (session.role === "student") {
    if (lecture.program === "o-level") {
      const subjectAccess = await getOLevelSubjectAccess(session.email, lecture.category);
      if (subjectAccess !== "unlocked") {
        return new NextResponse("Access denied", { status: 403 });
      }
    } else {
      const isIntro = lecture.category === "introduction";
      if (!isIntro && !lecture.is_free_preview) {
        const accessLevel = await getStudentAccessLevel(session.email);
        if (accessLevel !== "unlocked") {
          return new NextResponse("Access denied", { status: 403 });
        }
      }
    }
  }

  // Forward Range header so video seeking works
  const range = req.headers.get("range");
  const upstreamHeaders: HeadersInit = {};
  if (range) upstreamHeaders["Range"] = range;

  const upstream = await fetch(lecture.video_url, { headers: upstreamHeaders });

  const resHeaders = new Headers();
  resHeaders.set("Content-Type", upstream.headers.get("Content-Type") ?? "video/mp4");
  resHeaders.set("Cache-Control", "private, no-store");
  resHeaders.set("X-Content-Type-Options", "nosniff");

  for (const h of ["Content-Length", "Content-Range", "Accept-Ranges"]) {
    const v = upstream.headers.get(h);
    if (v) resHeaders.set(h, v);
  }

  return new NextResponse(upstream.body, { status: upstream.status, headers: resHeaders });
}
