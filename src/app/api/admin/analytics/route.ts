import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSkillAccuracy, getAITutorUsage, getAssessmentHistory } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = new URL(req.url).searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 });

  const [skills, aiUsage, assessments] = await Promise.all([
    getSkillAccuracy(studentId),
    getAITutorUsage(studentId),
    getAssessmentHistory(studentId),
  ]);

  return NextResponse.json({ skills, aiUsage, assessments });
}
