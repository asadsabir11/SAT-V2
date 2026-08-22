import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listSubmissions } from "@/lib/challans";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const submissions = await listSubmissions();
  return NextResponse.json({ submissions });
}
