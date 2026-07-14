import { NextRequest, NextResponse } from "next/server";
import { getQuizResults } from "@/lib/quiz";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const results = await getQuizResults(id);
  return NextResponse.json({ results });
}
