import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteByField, readData } from "@/lib/storage";
import { deleteParentsForStudent } from "@/lib/parent-system";
import { sql } from "@/lib/db";

interface Punjab9thLead {
  id: string;
  studentEmail?: string;
}

// This used to only remove the lead log entry, back when Punjab-9th was
// phase-1 (no accounts/dashboard). It has since grown a real login +
// access + assignments system, so "Delete" here must also remove the
// actual account — otherwise the student (and their password) silently
// keeps working after an admin believes they deleted the registration.
// Mirrors the SAT/O-Level lead-delete routes' account cleanup.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const leads = await readData<Punjab9thLead>("leads-punjab-9th.json");
  const email = leads.find((l) => l.id === id)?.studentEmail?.toLowerCase().trim();

  if (email) {
    const studentRows = await sql`SELECT id FROM users WHERE email = ${email} AND role = 'student' AND program = 'punjab-9th'`;
    for (const row of studentRows as { id: string }[]) {
      await deleteParentsForStudent(row.id);
    }
    await sql`DELETE FROM users WHERE email = ${email} AND role = 'student' AND program = 'punjab-9th'`;
  }

  await deleteByField("leads-punjab-9th.json", "id", id);
  return NextResponse.json({ ok: true });
}
