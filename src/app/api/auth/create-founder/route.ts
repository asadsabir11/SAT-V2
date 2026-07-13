import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/users";

// Protected endpoint to create founder accounts.
// Requires ADMIN_SECRET env var to match the request header.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  const adminSecret = (process.env.ADMIN_SECRET ?? "").trim();
  if (!secret || !adminSecret || secret !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, password, name } = await request.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "email, password, and name are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: `Account already exists for ${email}` }, { status: 409 });
    }

    await createUser(email, password, "founder", name);
    return NextResponse.json({ ok: true, message: `Founder account created for ${email}` });
  } catch (error) {
    console.error("Create founder error", error);
    return NextResponse.json({ error: "Failed to create founder account" }, { status: 500 });
  }
}
