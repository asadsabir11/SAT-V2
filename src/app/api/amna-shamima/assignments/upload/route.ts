import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Separate from /api/amna-shamima/materials/upload — that one is staff-only
// (admin posting study material). This one is used for BOTH staff (posting
// an assignment's instructions attachment) AND students (submitting their
// work), so its auth check is different, and its allow-list additionally
// covers Word docs, which materials/lectures uploads don't need.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  const isStaff = session?.role === "founder" || session?.role === "teacher";
  const isAmnaShamimaStudent = session?.role === "student" && session.program === "amna-shamima";
  if (!session || (!isStaff && !isAmnaShamimaStudent)) {
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
