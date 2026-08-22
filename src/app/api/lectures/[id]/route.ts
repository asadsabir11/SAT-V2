import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getLectureById, updateLecture, publishLecture, unpublishLecture, deleteLecture, setFreePreview, setIntroVideo, clearIntroVideo } from "@/lib/lectures";
import { getStudentAccessLevel } from "@/lib/users";
import { getOLevelSubjectAccess } from "@/lib/olevelAccess";
import { createNotification } from "@/lib/notifications";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const lecture = await getLectureById(id);
  if (!lecture) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!lecture.is_published && session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Enforce access for students
  if (session.role === "student") {
    if (lecture.program === "o-level") {
      if (!lecture.is_free_preview) {
        const subjectAccess = await getOLevelSubjectAccess(session.email, lecture.category);
        if (subjectAccess !== "unlocked") {
          return NextResponse.json({ error: "Access denied. Unlock this subject to watch this lecture." }, { status: 403 });
        }
      }
    } else {
      const accessLevel = await getStudentAccessLevel(session.email);
      const isIntro = lecture.category === "introduction";
      if (!isIntro && accessLevel !== "unlocked" && !lecture.is_free_preview) {
        return NextResponse.json({ error: "Access denied. Unlock full access to watch this lecture." }, { status: 403 });
      }
    }
    // Strip the real video URL — students stream via /api/lectures/[id]/stream
    const { video_url: _v, ...safeFields } = lecture;
    return NextResponse.json({ lecture: safeFields });
  }
  return NextResponse.json({ lecture });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  if (body.action === "publish") {
    await publishLecture(id);
    const lecture = await getLectureById(id);
    if (lecture) {
      await createNotification({
        type: "lecture",
        title: `New lecture: ${lecture.title}`,
        link: lecture.program === "o-level" ? `/o-level/lectures?subject=${lecture.category}` : `/lectures/${id}`,
        program: lecture.program,
        subject: lecture.program === "o-level" ? lecture.category : null,
      }).catch(console.error);
    }
    return NextResponse.json({ ok: true });
  }
  if (body.action === "unpublish")      { await unpublishLecture(id);            return NextResponse.json({ ok: true }); }
  if (body.action === "togglePreview")  { await setFreePreview(id, body.value);  return NextResponse.json({ ok: true }); }
  if (body.action === "toggleIntro") {
    if (body.value) {
      const lecture = await getLectureById(id);
      if (!lecture) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await setIntroVideo(id, lecture.program, lecture.category);
    } else {
      await clearIntroVideo(id);
    }
    return NextResponse.json({ ok: true });
  }
  if (body.title !== undefined) {
    await updateLecture(id, body.title, body.description ?? "", body.category);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteLecture(id);
  return NextResponse.json({ ok: true });
}
