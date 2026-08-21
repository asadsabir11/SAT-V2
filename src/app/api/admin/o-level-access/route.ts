import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listOLevelAccessRequests, grantOLevelAccess, revokeOLevelAccess } from "@/lib/olevelAccess";
import { OLEVEL_LECTURE_CATEGORIES } from "@/lib/lectures";
import { findUserByEmail } from "@/lib/users";
import { sendOLevelAccessGranted } from "@/lib/email";
import { sendMetaPurchaseEvent, sendGA4PurchaseEvent } from "@/lib/serverConversions";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const requests = await listOLevelAccessRequests();
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, email, subject, notes } = await req.json();
  if (!action || !email || !subject || !OLEVEL_LECTURE_CATEGORIES.includes(subject)) {
    return NextResponse.json({ error: "action, email and a valid subject are required" }, { status: 400 });
  }

  if (action === "grant") {
    await grantOLevelAccess(email, subject, session.email, notes);

    const student = await findUserByEmail(email);
    const tasks: Promise<unknown>[] = [
      sendOLevelAccessGranted({ email, name: student?.name ?? "there", subject }).catch(console.error),
    ];

    const value = subject === "mathematics" || subject === "english-language" ? 10000 : 0;
    if (value > 0) {
      const idempotencyKey = `${email}:${subject}`;
      tasks.push(
        sendMetaPurchaseEvent({ applicationId: idempotencyKey, subject, value }).catch(console.error),
        sendGA4PurchaseEvent({ applicationId: idempotencyKey, subject, value }).catch(console.error),
      );
    }
    await Promise.all(tasks);

    return NextResponse.json({ ok: true });
  }
  if (action === "revoke") {
    await revokeOLevelAccess(email, subject);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
