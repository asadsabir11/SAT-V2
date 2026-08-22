import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserProgram } from "@/lib/users";
import { getOLevelAccessMap } from "@/lib/olevelAccess";
import { listNotificationsForStudent, getLastSeenAt } from "@/lib/notifications";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const program = session.program ?? (await getUserProgram(session.email));
  const [rows, lastSeenAt] = await Promise.all([
    listNotificationsForStudent(session.id, program),
    getLastSeenAt(session.id),
  ]);

  // O-Level broadcasts scoped to a specific subject only reach students who
  // actually have that subject unlocked — a "new Mathematics quiz" alert is
  // noise for someone who's never touched Mathematics.
  let notifications = rows;
  if (program === "o-level") {
    const access = await getOLevelAccessMap(session.email);
    notifications = rows.filter(n => !n.subject || access[n.subject] === "unlocked");
  }

  const unreadCount = lastSeenAt
    ? notifications.filter(n => new Date(n.created_at) > new Date(lastSeenAt)).length
    : notifications.length;

  return NextResponse.json({ notifications, unreadCount, lastSeenAt });
}
