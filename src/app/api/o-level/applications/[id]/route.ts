import { NextRequest, NextResponse } from "next/server";
import { getApplicationById } from "@/lib/olevelApplications";

// Public by design — the ID is an unguessable UUID, and this is how the parent's
// browser (no login) re-fetches their own application to prefill the payment page.
// Only a safe subset of fields is returned; no admin notes are exposed.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = await getApplicationById(id);
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    application: {
      id: app.id,
      parent_name: app.parent_name,
      student_name: app.student_name,
      subject: app.subject,
      amount_due: app.amount_due,
      status: app.status,
      parent_whatsapp: app.parent_whatsapp,
    },
  });
}
