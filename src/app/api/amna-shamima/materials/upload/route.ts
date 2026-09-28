import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Separate from /api/lectures/upload rather than widening its allow-list —
// that endpoint's content types are scoped to video lectures/cover images;
// this one is scoped to the study-material file types (PDFs + images) and a
// much smaller size cap, matching this codebase's convention of isolated
// per-feature modules over widening shared ones.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"],
        maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
