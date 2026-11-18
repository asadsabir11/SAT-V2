import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPunjab10thAccessLevel } from "@/lib/punjab10thAccess";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "punjab-10th") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const access_level = await getPunjab10thAccessLevel(session.email);
  return NextResponse.json({ access_level });
}
