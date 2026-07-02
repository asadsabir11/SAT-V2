import { NextRequest, NextResponse } from "next/server";
import { appendData, findByField } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const record = { ...body, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    appendData("diagnostics.json", record);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  const result = findByField("diagnostics.json", "email", email);
  return NextResponse.json({ result });
}
