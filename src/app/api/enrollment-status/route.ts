import { NextResponse } from "next/server";
import { getEnrollmentStatuses } from "@/lib/enrollmentStatus";

// Deliberately public (no auth) and outside /api/admin — the home page's
// "Fully Booked" badges are public marketing content, not admin data, and
// are fetched client-side specifically so the homepage itself can stay a
// fully static page rather than becoming dynamic on every request just for
// a 3-row status lookup. Just "open"/"full" per program, nothing sensitive.
export async function GET() {
  const statuses = await getEnrollmentStatuses();
  return NextResponse.json({ statuses });
}
