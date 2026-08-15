import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { markBestAnswer, deleteReply, getReplies } from "@/lib/discussion";

type Params = { params: Promise<{ id: string; replyId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: postId, replyId } = await params;
  await markBestAnswer(replyId, postId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: postId, replyId } = await params;
  // Founder can delete any reply; student can delete their own
  const replies = await getReplies(postId);
  const reply = replies.find(r => r.id === replyId);
  if (!reply) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.role !== "founder" && session.role !== "teacher" && reply.author_email !== session.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await deleteReply(replyId);
  return NextResponse.json({ ok: true });
}
