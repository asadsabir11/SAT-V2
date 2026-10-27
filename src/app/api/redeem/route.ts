import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { redeemBookCode, type BookCodeProgram } from "@/lib/bookCodes";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

const REDEEMABLE_PROGRAMS: BookCodeProgram[] = ["o-level", "punjab-9th", "a-level"];

// Public book-code redemption — requires a signed-in student (the code
// grants access to that student's own account), but any logged-in role
// other than student is rejected since this only ever makes sense for a
// program account. Codes are short printed strings, so this is rate-limited
// per IP same as login/apply, to make guessing impractical.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "student" || !session.program) {
    return NextResponse.json({ error: "Please log in to your student account first." }, { status: 401 });
  }
  if (!REDEEMABLE_PROGRAMS.includes(session.program as BookCodeProgram)) {
    return NextResponse.json({ error: "Book code redemption isn't available for this program." }, { status: 400 });
  }

  const allowed = await checkRateLimit(`redeem:${clientIp(req)}`, 10, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "Enter the code printed in your book." }, { status: 400 });
  }

  const result = await redeemBookCode(code, session.email, session.name, session.program as BookCodeProgram);

  if (!result.ok) {
    const messages: Record<string, string> = {
      not_found: "That code wasn't recognized. Please check it and try again.",
      already_used: "This code has already been redeemed.",
      wrong_program: "This code is for a different program than your account.",
    };
    return NextResponse.json({ error: messages[result.error] }, { status: 400 });
  }

  return NextResponse.json({ ok: true, program: result.program, subject: result.subject });
}
