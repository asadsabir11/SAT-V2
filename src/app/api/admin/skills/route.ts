import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSkills, seedSkills } from "@/lib/analytics";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const skills = await getSkills();
  return NextResponse.json({ skills });
}

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await seedSkills();
  const skills = await getSkills();
  return NextResponse.json({ ok: true, skills });
}
