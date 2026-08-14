import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getApplicationById } from "@/lib/olevelApplications";
import { sendOLevelEnrollmentConfirmed } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const app = await getApplicationById(id);
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  await sendOLevelEnrollmentConfirmed(app, {
    startDate: body.startDate?.trim() || undefined,
    schedule: body.schedule?.trim() || undefined,
    orientationDate: body.orientationDate?.trim() || undefined,
    nextSteps: body.nextSteps?.trim() || undefined,
  });

  return NextResponse.json({ ok: true });
}
