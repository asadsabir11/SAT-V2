import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listWorkbooks, createWorkbook } from "@/lib/workbooks";

// Deliberately public — workbooks are downloadable by anyone, no sign-in
// required, unlike lectures/quizzes/past-papers which are gated.
export async function GET() {
  const workbooks = await listWorkbooks();
  return NextResponse.json({ workbooks });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, fileUrl, fileName } = body;
  if (!title?.trim() || !fileUrl || !fileName) {
    return NextResponse.json({ error: "title, fileUrl, and fileName are required" }, { status: 400 });
  }

  const id = await createWorkbook({ title: title.trim(), fileUrl, fileName, uploadedBy: session.email });
  return NextResponse.json({ ok: true, id });
}
