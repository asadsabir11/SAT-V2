import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStudentForParent, getReportForStudent, listReportsForStudent, getHomeworkForStudent, getAttendanceForStudent } from "@/lib/parent-system";
import { getAssessmentHistory } from "@/lib/analytics";
import { getSubjectPerformanceForStudent, getRecentAttemptsForStudent } from "@/lib/olevel-quiz";
import { getSubject } from "@/lib/academy/data";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "parent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await getStudentForParent(session.id);
  if (!student) {
    return NextResponse.json({ error: "No student linked to this account. Contact your tutor." }, { status: 404 });
  }

  const studentId = (student as { id: string; email: string; program: string }).id;
  const studentEmail = (student as { id: string; email: string; program: string }).email;
  const isOLevel = (student as { program: string }).program === "o-level";

  if (isOLevel) {
    const [latestReport, reports, attendance, subjectsRaw, recentAttempts] = await Promise.all([
      getReportForStudent(studentId),
      listReportsForStudent(studentId),
      getAttendanceForStudent(studentId),
      getSubjectPerformanceForStudent(studentEmail),
      getRecentAttemptsForStudent(studentEmail),
    ]);
    const subjects = subjectsRaw.map((s) => ({ ...s, subjectLabel: getSubject(s.subject)?.name ?? s.subject }));
    return NextResponse.json({ student, latestReport, reports, homework: [], attendance, subjects, recentAttempts });
  }

  const [latestReport, reports, homework, attendance, scoreHistory] = await Promise.all([
    getReportForStudent(studentId),
    listReportsForStudent(studentId),
    getHomeworkForStudent(studentId),
    getAttendanceForStudent(studentId),
    getAssessmentHistory(studentId),
  ]);

  return NextResponse.json({ student, latestReport, reports, homework, attendance, scoreHistory });
}
