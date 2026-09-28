import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllQAPosts, createQAPost } from "@/lib/amnaShamimaQA";

function canAccess(session: { role: string; program?: string | null } | null) {
  if (!session) return false;
  if (session.role === "founder" || session.role === "teacher") return true;
  return session.role === "student" && session.program === "amna-shamima";
}

export async function GET() {
  const session = await getSession();
  if (!canAccess(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const posts = await getAllQAPosts();
  return NextResponse.json({ posts });
}

// Only students post questions — staff answer them from the admin page.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, body } = await req.json();
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Title and question are required" }, { status: 400 });
  }
  const id = await createQAPost({ title: title.trim(), body: body.trim(), author_email: session.email, author_name: session.name });
  return NextResponse.json({ id });
}
