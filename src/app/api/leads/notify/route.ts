import { NextRequest, NextResponse } from "next/server";
import { appendData } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const { email, material } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  await appendData("material-notify", { id: crypto.randomUUID(), email, material, createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
