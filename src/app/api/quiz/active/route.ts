import { NextResponse } from "next/server";
import { getActiveQuiz } from "@/lib/quiz";

export async function GET() {
  const quiz = await getActiveQuiz();
  return NextResponse.json({ quiz });
}
