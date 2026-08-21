import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listStudentsWithAccess, grantAccess, revokeAccess, findUserByEmailAndProgram } from "@/lib/users";
import { sendSatAccessGranted } from "@/lib/email";
import { sendMetaPurchaseEvent, sendGA4PurchaseEvent } from "@/lib/serverConversions";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const students = await listStudentsWithAccess();
  return NextResponse.json({ students });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, email, notes } = await req.json();
  if (!action || !email) {
    return NextResponse.json({ error: "action and email are required" }, { status: 400 });
  }

  if (action === "grant") {
    const student = await findUserByEmailAndProgram(email, "sat");
    await grantAccess(email, session.email, notes);

    const tasks: Promise<unknown>[] = [
      sendSatAccessGranted({ email, name: student?.name ?? "there" }).catch(console.error),
    ];

    const value = Number(student?.amount_paid ?? 0);
    if (value > 0) {
      const idempotencyKey = `sat:${email}`;
      tasks.push(
        sendMetaPurchaseEvent({ applicationId: idempotencyKey, subject: "SAT Full Access", value }).catch(console.error),
        sendGA4PurchaseEvent({ applicationId: idempotencyKey, subject: "SAT Full Access", value }).catch(console.error),
      );
    }
    await Promise.all(tasks);

    return NextResponse.json({ ok: true });
  }
  if (action === "revoke") {
    await revokeAccess(email);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
