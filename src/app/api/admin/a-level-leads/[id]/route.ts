import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteByField, readData } from "@/lib/storage";
import { deleteParentsForStudent } from "@/lib/parent-system";
import { sql } from "@/lib/db";

interface ALevelLead {
  id: string;
  studentEmail?: string;
}

// Mirrors the SAT/O-Level lead-delete routes' account cleanup — "Delete"
// here must also remove the actual login account, not just the lead log
// entry, otherwise the student (and their password) silently keeps
// working after an admin believes they deleted the registration.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const leads = await readData<ALevelLead>("leads-a-level.json");
  const email = leads.find((l) => l.id === id)?.studentEmail?.toLowerCase().trim();

  if (email) {
    const studentRows = await sql`SELECT id FROM users WHERE email = ${email} AND role = 'student' AND program = 'a-level'`;
    for (const row of studentRows as { id: string }[]) {
      await deleteParentsForStudent(row.id);
    }
    await sql`DELETE FROM users WHERE email = ${email} AND role = 'student' AND program = 'a-level'`;
    // Per-subject access lives in its own table (added after this route was
    // first written, when A-Level was still flat) — without this, a
    // re-registration under the same email inherited whatever Vol 1/Vol 2
    // access the deleted account still had, bypassing the book-redemption
    // flow entirely.
    await sql`DELETE FROM a_level_subject_access WHERE email = ${email}`;
  }

  await deleteByField("leads-a-level.json", "id", id);
  return NextResponse.json({ ok: true });
}
