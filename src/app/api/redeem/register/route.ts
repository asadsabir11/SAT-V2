import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmailAndProgram } from "@/lib/users";
import { createToken, AUTH_COOKIE } from "@/lib/auth";
import { isValidEmail, passwordStrengthError } from "@/lib/validators";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { createNotification } from "@/lib/notifications";
import { recordBookRegistration, type BookCodeProgram } from "@/lib/bookCodes";

type BookProgram = BookCodeProgram;
const VALID_PROGRAMS: BookProgram[] = ["o-level", "punjab-9th", "a-level"];
const PROGRAM_LABELS: Record<BookProgram, string> = { "o-level": "O Level", "punjab-9th": "9th Class", "a-level": "A Level" };

// Deliberately separate from each program's full OLevelRegistrationForm/etc
// — those collect parent contact, city, exam session and so on for the
// admissions/follow-up funnel, which doesn't apply here: a book-redemption
// student already proved purchase via their code, they're not a lead that
// needs chasing. Just enough to create an account the redeem flow can grant
// access to. One shared route/form for all three programs (which one is
// decided by which "Register for X" link the student clicked on /redeem,
// not by anything shown in this form).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const allowed = await checkRateLimit(`book-register:${clientIp(req)}`, 8, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const program = body.program;
    if (!VALID_PROGRAMS.includes(program)) {
      return NextResponse.json({ error: "Invalid program" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    const pwError = passwordStrengthError(String(body.password ?? ""));
    if (pwError) {
      return NextResponse.json({ error: `Password: ${pwError}` }, { status: 400 });
    }

    const existing = await findUserByEmailAndProgram(email, program);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists for this program. Please log in instead." }, { status: 409 });
    }

    const userId = await createUser(email, String(body.password), "student", name, program);
    await recordBookRegistration(email, name, program as BookCodeProgram);

    createNotification({
      type: "registration",
      audience: "admin",
      title: `New ${PROGRAM_LABELS[program as BookProgram]} book-code student: ${name}`,
      body: `Registered via printed-book redemption (${email})`,
      link: "/admin/book-registrations",
    }).catch(console.error);

    const token = await createToken({ id: userId, email, role: "student", name, program: program as BookProgram });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("Book-redemption registration failed", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
