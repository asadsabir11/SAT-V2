import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureSatQuizTables } from "@/lib/satQuizzes";
import { createNotification } from "@/lib/notifications";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSatQuizTables();
  const { id } = await params;
  const [quiz] = await sql`UPDATE quiz_sets SET is_published = NOT is_published WHERE id = ${id} RETURNING *`;
  // This toggles both ways — only notify on the transition INTO published.
  if (quiz?.is_published) {
    await createNotification({
      type: "quiz",
      title: `New quiz: ${quiz.title}`,
      link: "/quizzes",
      program: "sat",
    }).catch(console.error);
  }
  return NextResponse.json({ quiz });
}
