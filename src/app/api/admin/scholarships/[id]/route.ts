import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateScholarshipStatus, deleteScholarshipApplication, SCHOLARSHIP_STATUSES, type ScholarshipStatus } from "@/lib/scholarships";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const status = body.status as ScholarshipStatus;
  if (!SCHOLARSHIP_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const percentage = body.scholarshipPercentage === null || body.scholarshipPercentage === undefined
    ? null
    : Number(body.scholarshipPercentage);
  if (percentage !== null && (Number.isNaN(percentage) || percentage < 0 || percentage > 100)) {
    return NextResponse.json({ error: "Scholarship percentage must be between 0 and 100" }, { status: 400 });
  }

  const updated = await updateScholarshipStatus(id, status, percentage, body.adminNotes);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ application: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteScholarshipApplication(id);
  return NextResponse.json({ ok: true });
}
