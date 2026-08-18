import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStudentForParent } from "@/lib/parent-system";
import { getSkillAccuracy } from "@/lib/analytics";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "parent") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const student = await getStudentForParent(session.id);
  if (!student) return NextResponse.json({ error: "No student linked" }, { status: 404 });

  if ((student as { program: string }).program === "o-level") return NextResponse.json({ skills: [] });

  const skills = await getSkillAccuracy(student.id as string);
  return NextResponse.json({ skills });
}
