import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { markNotificationsSeen } from "@/lib/notifications";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await markNotificationsSeen(session.id);
  return NextResponse.json({ ok: true });
}
