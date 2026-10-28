import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { deleteParentsForStudent } from "@/lib/parent-system";

// Book-redemption students deliberately never get a row in any program's
// leads-*.json (see /api/redeem/register's own comment — they're not
// marketing leads), so the regular per-program lead-delete routes have
// nothing to find for them and can't clean them up. This is their own
// delete path: full account cleanup (users row, parent links, and
// whichever program's per-subject access table applies), plus the
// registration record itself. Doesn't touch the originating book code —
// a redeemed code stays marked used even if the account is later deleted,
// so it can't be silently redeemed a second time.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const rows = await sql`SELECT email, program FROM book_redemption_registrations WHERE id = ${id} LIMIT 1`;
  const reg = rows[0] as { email: string; program: string } | undefined;

  if (reg) {
    const { email, program } = reg;

    const studentRows = await sql`SELECT id FROM users WHERE email = ${email} AND role = 'student' AND program = ${program}`;
    for (const row of studentRows as { id: string }[]) {
      await deleteParentsForStudent(row.id);
    }
    await sql`DELETE FROM users WHERE email = ${email} AND role = 'student' AND program = ${program}`;

    if (program === "o-level") {
      await sql`DELETE FROM olevel_subject_access WHERE email = ${email}`;
    } else if (program === "a-level") {
      await sql`DELETE FROM a_level_subject_access WHERE email = ${email}`;
    }
    // punjab-9th has no separate access table — access_level lives directly
    // on the users row, already removed above.
  }

  await sql`DELETE FROM book_redemption_registrations WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
