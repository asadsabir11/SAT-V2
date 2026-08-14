import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getApplicationById, updateApplicationStatus, updateApplicationNotes, deleteApplication, subjectsToGrant, amountDueForSubject, APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/olevelApplications";
import { grantOLevelAccess, revokeOLevelAccess } from "@/lib/olevelAccess";
import { sendMetaPurchaseEvent, sendGA4PurchaseEvent } from "@/lib/serverConversions";

const ACCESS_GRANTING_STATUSES: ApplicationStatus[] = ["payment_verified", "enrolled"];
const ACCESS_REVOKING_STATUSES: ApplicationStatus[] = ["refunded", "cancelled", "declined"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const before = await getApplicationById(id);
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  if (body.adminNotes !== undefined && body.status === undefined) {
    await updateApplicationNotes(id, body.adminNotes);
    return NextResponse.json({ ok: true });
  }

  const status = body.status as ApplicationStatus;
  if (!APPLICATION_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await updateApplicationStatus(id, status, body.adminNotes);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const wasGranted = ACCESS_GRANTING_STATUSES.includes(before.status);
  const nowGranted = ACCESS_GRANTING_STATUSES.includes(status);
  const subjects = subjectsToGrant(updated.subject);

  if (!wasGranted && nowGranted) {
    for (const subject of subjects) {
      await grantOLevelAccess(updated.parent_email, subject, session.email, `O-Level application ${updated.id}`);
    }
    const value = updated.amount_paid ?? amountDueForSubject(updated.subject) ?? 0;
    sendMetaPurchaseEvent({ applicationId: updated.id, subject: updated.subject, value }).catch(console.error);
    sendGA4PurchaseEvent({ applicationId: updated.id, subject: updated.subject, value }).catch(console.error);
  } else if (wasGranted && ACCESS_REVOKING_STATUSES.includes(status)) {
    for (const subject of subjects) {
      await revokeOLevelAccess(updated.parent_email, subject);
    }
  }

  return NextResponse.json({ application: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteApplication(id);
  return NextResponse.json({ ok: true });
}
