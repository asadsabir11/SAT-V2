import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateMonthlyChallans } from "@/lib/challans";

const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// Bulk-generates a given month's challans (defaults to the current month)
// for every currently-unlocked student. Idempotent, so re-clicking after a
// partial run (or picking the same period again) is safe — existing
// challans for that period are left untouched.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const period = typeof body.period === "string" && PERIOD_RE.test(body.period) ? body.period : defaultPeriod;

  const result = await generateMonthlyChallans(period);

  return NextResponse.json({ ok: true, period, ...result });
}
