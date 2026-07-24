import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllPosts, createPost } from "@/lib/discussion";
import { getStudentAccessLevel } from "@/lib/users";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "student") {
    const accessLevel = await getStudentAccessLevel(session.email);
    if (accessLevel !== "unlocked") {
      return NextResponse.json({ posts: [], access_level: accessLevel, locked: true });
    }
  }

  const topic = req.nextUrl.searchParams.get("topic") ?? "All";
  const posts = await getAllPosts(topic);
  return NextResponse.json({ posts, access_level: "unlocked" });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "student") {
    const accessLevel = await getStudentAccessLevel(session.email);
    if (accessLevel !== "unlocked") {
      return NextResponse.json({ error: "Full access required" }, { status: 403 });
    }
  }

  const { title, body, topic } = await req.json();
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }
  const id = await createPost({
    title: title.trim(), body: body.trim(),
    topic: topic ?? "General",
    author_email: session.email,
    author_name: session.name,
  });
  return NextResponse.json({ id });
}
