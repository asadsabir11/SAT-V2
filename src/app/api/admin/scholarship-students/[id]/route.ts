import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getScholarshipApplicationById, deleteScholarshipApplication } from "@/lib/scholarships";
import { deleteParentsForStudent } from "@/lib/parent-system";
import { sql } from "@/lib/db";

// Deletes a scholarship student fully — the linked account (and everything
// tied to it, same cascade the SAT/O-Level student-delete routes use) plus
// the application record itself. Distinct from the Delete button on
// /admin/scholarships, which only removes the application and leaves the
// account alone — this one is "remove this student," not "remove this
// application."
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const application = await getScholarshipApplicationById(id);
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (application.student_user_id) {
    const userId = application.student_user_id;
    await deleteParentsForStudent(userId);
    await sql`DELETE FROM users WHERE id = ${userId}`;
    if (application.program === "o-level" && application.student_email) {
      await sql`DELETE FROM olevel_subject_access WHERE email = ${application.student_email}`;
    }
  }

  await deleteScholarshipApplication(id);
  return NextResponse.json({ ok: true });
}
