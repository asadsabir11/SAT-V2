import { NextRequest, NextResponse } from "next/server";
import { consumeResetToken } from "@/lib/passwordReset";
import { updateUserPassword } from "@/lib/users";
import { passwordStrengthError } from "@/lib/validators";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing or invalid reset link" }, { status: 400 });
    }

    const pwError = passwordStrengthError(String(password ?? ""));
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 });
    }

    const allowed = await checkRateLimit(`reset-password:${clientIp(request)}`, 10, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const email = await consumeResetToken(token);
    if (!email) {
      return NextResponse.json({ error: "This reset link is invalid or has expired. Please request a new one." }, { status: 400 });
    }

    await updateUserPassword(email, password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reset password error", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
