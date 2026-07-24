import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createReply } from "@/lib/discussion";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: post_id } = await params;
  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Reply body is required" }, { status: 400 });
  const id = await createReply({
    post_id, body: body.trim(),
    author_email: session.email,
    author_name: session.name,
    is_instructor: session.role === "founder",
  });
  return NextResponse.json({ id });
}
