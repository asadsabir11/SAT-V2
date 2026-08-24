import { NextRequest, NextResponse } from "next/server";
import { recordWorkbookDownload } from "@/lib/workbooks";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

// Public and fire-and-forget by design — called from an onClick alongside
// the actual file download, purely to count it. Never blocks or fails the
// download itself; a failure here is silently swallowed by the caller.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const allowed = await checkRateLimit(`workbook-download:${clientIp(req)}`, 20, 10);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { id } = await params;
  const downloadCount = await recordWorkbookDownload(id);
  return NextResponse.json({ ok: true, downloadCount });
}
