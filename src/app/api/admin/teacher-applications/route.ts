import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readData } from "@/lib/storage";

interface TeacherApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  createdAt: string;
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const applications = await readData<TeacherApplication>("teacher-applications.json");
  return NextResponse.json({ applications: applications.slice().reverse() });
}
