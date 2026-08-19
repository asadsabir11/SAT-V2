import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

// Deliberately narrow and irreversible: wipes every parent account and
// every parent-student link, across BOTH programs, in one shot. Founder-
// only, and only ever called from an explicit "type DELETE to confirm"
// action in the admin UI — never exposed as a casual one-click button.
export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Links first, then the accounts themselves — no FK constraint enforces
  // this order (parent_student_links has no REFERENCES clause), but it's
  // the cleaner sequence: sever the connections before removing what they
  // pointed at.
  await sql`DELETE FROM parent_student_links`;
  const deleted = await sql`DELETE FROM users WHERE role = 'parent' RETURNING id`;

  return NextResponse.json({ ok: true, deletedParents: deleted.length });
}
