import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listNotificationsForAdmin, getLastSeenAt } from "@/lib/notifications";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [notifications, lastSeenAt] = await Promise.all([
    listNotificationsForAdmin(),
    getLastSeenAt(session.id),
  ]);

  const unreadCount = lastSeenAt
    ? notifications.filter(n => new Date(n.created_at) > new Date(lastSeenAt)).length
    : notifications.length;

  return NextResponse.json({ notifications, unreadCount, lastSeenAt });
}
