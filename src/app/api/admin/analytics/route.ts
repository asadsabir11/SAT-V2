import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSkillAccuracy, getAITutorUsage, getAssessmentHistory } from "@/lib/analytics";
import { getSubjectPerformanceForStudent, getRecentAttemptsForStudent } from "@/lib/olevel-quiz";
import { getSubject } from "@/lib/academy/data";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = new URL(req.url).searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 });

  const studentRows = await sql`SELECT email, program FROM users WHERE id = ${studentId}`;
  const student = studentRows[0] as { email: string; program: string } | undefined;
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  if (student.program === "o-level") {
    const [subjectsRaw, recentAttempts, aiUsage] = await Promise.all([
      getSubjectPerformanceForStudent(student.email),
      getRecentAttemptsForStudent(student.email),
      getAITutorUsage(studentId),
    ]);
    const subjects = subjectsRaw.map((s) => ({ ...s, subjectLabel: getSubject(s.subject)?.name ?? s.subject }));
    return NextResponse.json({ program: "o-level", subjects, recentAttempts, aiUsage });
  }

  const [skills, aiUsage, assessments] = await Promise.all([
    getSkillAccuracy(studentId),
    getAITutorUsage(studentId),
    getAssessmentHistory(studentId),
  ]);

  return NextResponse.json({ program: "sat", skills, aiUsage, assessments });
}
