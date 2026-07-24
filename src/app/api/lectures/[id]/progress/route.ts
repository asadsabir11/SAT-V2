import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { markLectureCompleted } from "@/lib/lecture-quiz";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await markLectureCompleted(id, session.email);
  return NextResponse.json({ ok: true });
}
