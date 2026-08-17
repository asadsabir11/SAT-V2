import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOLevelAccessById } from "@/lib/olevelAccess";
import { get } from "@vercel/blob";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const row = await getOLevelAccessById(id);
  if (!row || !row.payment_screenshot_url) {
    return new NextResponse("Not found", { status: 404 });
  }

  const result = await get(row.payment_screenshot_url, { access: "public" });
  if (!result || !result.stream) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Cache-Control": "private, no-store",
    },
  });
}
