import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/users";
import { createResetToken } from "@/lib/passwordReset";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { isValidEmail } from "@/lib/validators";

const APP_URL = "https://academy.thedigitaltutor.net";

// Self-serve password reset — students only. Founder/parent accounts are
// managed manually (see reset-founder-password), kept off this public endpoint.
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    const allowed = await checkRateLimit(`forgot-password:${clientIp(request)}`, 5, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // Always respond the same way regardless of whether the account exists,
    // so this endpoint can't be used to check which emails are registered.
    const user = await findUserByEmail(email);
    if (user && user.role === "student") {
      const token = await createResetToken(user.email);
      const resetUrl = `${APP_URL}/reset-password?token=${token}`;
      sendPasswordResetEmail({ email: user.email, name: user.name ?? "there", resetUrl }).catch(console.error);
    }

    return NextResponse.json({ ok: true, message: "If an account exists for that email, we've sent a password reset link." });
  } catch (error) {
    console.error("Forgot password error", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
