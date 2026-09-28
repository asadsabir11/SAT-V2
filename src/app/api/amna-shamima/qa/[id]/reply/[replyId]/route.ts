import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteQAReply } from "@/lib/amnaShamimaQA";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; replyId: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { replyId } = await params;
  await deleteQAReply(replyId);
  return NextResponse.json({ ok: true });
}
