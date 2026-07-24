import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requestAccess, getStudentAccessLevel } from "@/lib/users";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const current = await getStudentAccessLevel(session.email);
  if (current === "unlocked") {
    return NextResponse.json({ ok: true, access_level: "unlocked" });
  }
  if (current === "pending") {
    return NextResponse.json({ ok: true, access_level: "pending" });
  }

  await requestAccess(session.email);
  return NextResponse.json({ ok: true, access_level: "pending" });
}
