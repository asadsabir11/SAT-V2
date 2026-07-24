import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStudentForParent, getReportForStudent, getHomeworkForStudent, getAttendanceForStudent } from "@/lib/parent-system";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "parent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await getStudentForParent(session.id);
  if (!student) {
    return NextResponse.json({ error: "No student linked to this account. Contact your tutor." }, { status: 404 });
  }

  const [latestReport, homework, attendance] = await Promise.all([
    getReportForStudent((student as { id: string }).id),
    getHomeworkForStudent((student as { id: string }).id),
    getAttendanceForStudent((student as { id: string }).id),
  ]);

  return NextResponse.json({ student, latestReport, homework, attendance });
}
