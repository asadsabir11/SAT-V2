import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateMonthlyChallans } from "@/lib/challans";

// Bulk-generates this month's challans for every currently-unlocked student.
// Idempotent, so re-clicking after a partial run (or next month) is safe —
// existing challans for a period are left untouched.
export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const result = await generateMonthlyChallans(period);

  return NextResponse.json({ ok: true, period, ...result });
}
