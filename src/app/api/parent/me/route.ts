import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStudentForParent, getReportForStudent, listReportsForStudent, getHomeworkForStudent, getAttendanceForStudent } from "@/lib/parent-system";
import { getAssessmentHistory } from "@/lib/analytics";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "parent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await getStudentForParent(session.id);
  if (!student) {
    return NextResponse.json({ error: "No student linked to this account. Contact your tutor." }, { status: 404 });
  }

  const studentId = (student as { id: string }).id;
  const [latestReport, reports, homework, attendance, scoreHistory] = await Promise.all([
    getReportForStudent(studentId),
    listReportsForStudent(studentId),
    getHomeworkForStudent(studentId),
    getAttendanceForStudent(studentId),
    getAssessmentHistory(studentId),
  ]);

  return NextResponse.json({ student, latestReport, reports, homework, attendance, scoreHistory });
}
