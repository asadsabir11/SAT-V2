import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getQAPostById, getQAReplies, deleteQAPost } from "@/lib/amnaShamimaQA";

type Params = { params: Promise<{ id: string }> };

function canAccess(session: { role: string; program?: string | null } | null) {
  if (!session) return false;
  if (session.role === "founder" || session.role === "teacher") return true;
  return session.role === "student" && session.program === "amna-shamima";
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!canAccess(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const post = await getQAPostById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const replies = await getQAReplies(id);
  return NextResponse.json({ post, replies });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteQAPost(id);
  return NextResponse.json({ ok: true });
}
