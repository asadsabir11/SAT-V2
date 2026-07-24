import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPostById, getReplies, deletePost } from "@/lib/discussion";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [post, replies] = await Promise.all([getPostById(id), getReplies(id)]);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post, replies });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Founder can delete any post; student can only delete their own
  if (session.role !== "founder" && post.author_email !== session.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await deletePost(id);
  return NextResponse.json({ ok: true });
}
