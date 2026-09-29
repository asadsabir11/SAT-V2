import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Mirrors /api/amna-shamima/assignments/upload — separate per-program upload
// endpoint rather than a shared one, since auth differs (staff OR that
// program's students) and this is the established convention for this
// feature already.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  const isStaff = session?.role === "founder" || session?.role === "teacher";
  const isOLevelStudent = session?.role === "student" && session.program === "o-level";
  if (!session || (!isStaff && !isOLevelStudent)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg", "image/png", "image/webp", "image/gif",
        ],
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
