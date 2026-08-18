import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteWorkbook } from "@/lib/workbooks";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteWorkbook(id);
  return NextResponse.json({ ok: true });
}
