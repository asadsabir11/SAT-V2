import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPunjab9thAccessLevel } from "@/lib/punjab9thAccess";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "punjab-9th") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const access_level = await getPunjab9thAccessLevel(session.email);
  return NextResponse.json({ access_level });
}
