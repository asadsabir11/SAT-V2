import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createQAReply } from "@/lib/amnaShamimaQA";

// Staff-only — students ask questions, they don't answer each other's here.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { body, attachment_url } = await req.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
  }
  const replyId = await createQAReply({ post_id: id, body: body.trim(), attachment_url: attachment_url?.trim() || null, author_email: session.email, author_name: session.name });
  return NextResponse.json({ id: replyId });
}
