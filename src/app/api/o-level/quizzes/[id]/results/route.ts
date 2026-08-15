import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getQuizResults } from "@/lib/olevel-quiz";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const attempts = await getQuizResults(id);
  return NextResponse.json({ attempts });
}
