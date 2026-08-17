import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getApplicationById } from "@/lib/olevelApplications";
import { get } from "@vercel/blob";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const app = await getApplicationById(id);
  if (!app || !app.payment_screenshot_url) {
    return new NextResponse("Not found", { status: 404 });
  }

  const result = await get(app.payment_screenshot_url, { access: "public" });
  if (!result || !result.stream) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Cache-Control": "private, no-store",
    },
  });
}
