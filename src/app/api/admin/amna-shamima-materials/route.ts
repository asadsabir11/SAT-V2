import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllAmnaShamimaMaterials, createAmnaShamimaMaterial } from "@/lib/amnaShamimaMaterials";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const materials = await getAllAmnaShamimaMaterials();
  return NextResponse.json({ materials });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, description, file_url } = await req.json();
  if (!title?.trim() || !file_url?.trim()) {
    return NextResponse.json({ error: "Title and file are required" }, { status: 400 });
  }
  const id = await createAmnaShamimaMaterial(title.trim(), description?.trim() ?? "", file_url.trim(), session.email);
  return NextResponse.json({ id });
}
