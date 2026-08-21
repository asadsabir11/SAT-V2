import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStudentAccessLevel, grantAccess } from "@/lib/users";
import { findApprovedScholarshipForStudent } from "@/lib/scholarships";
import { sendSatAccessGranted } from "@/lib/email";

// Self-service unlock for the "I'm a scholarship student" checkbox on the
// SAT unlock page — mirrors /api/o-level/access/scholarship-unlock. Skips
// the payment form entirely and instead checks the logged-in account
// against approved scholarships for this program.
export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const current = await getStudentAccessLevel(session.email);
  if (current === "unlocked") {
    return NextResponse.json({ ok: true, access_level: "unlocked" });
  }

  const scholarship = await findApprovedScholarshipForStudent(session.id, "sat");
  if (!scholarship) {
    return NextResponse.json(
      { error: "We couldn't find an approved Opportunity Scholarship linked to your account. Please pay the amount to unlock full access." },
      { status: 403 }
    );
  }

  await grantAccess(session.email, "scholarship", `Opportunity Scholarship ${scholarship.id} — self-service unlock, no payment`);
  await sendSatAccessGranted({ email: session.email, name: session.name }).catch(console.error);

  return NextResponse.json({ ok: true, access_level: "unlocked" });
}
