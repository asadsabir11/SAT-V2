import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { appendData, findByField } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const record = { ...body, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    await appendData("diagnostics.json", record);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Diagnostic save failed", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Students can only read their own diagnostic; founders can read any
  if (session.role === "student" && session.email !== email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await findByField("diagnostics.json", "email", email);
  return NextResponse.json({ result });
}
