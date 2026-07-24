import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStudentAccessLevel } from "@/lib/users";
import { sendToN8n } from "@/lib/n8n";
import { ensureAnalyticsTables } from "@/lib/analytics";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL!);

const rules =
  "You are an independent SAT preparation support tutor. Never claim official affiliation, guarantee scores, copy copyrighted questions, or invent official policy. Use original examples, ask the student to try first, explain step by step, and suggest human help after repeated confusion.";

function mock(mode: string, message: string) {
  return `Let's work on this as your ${mode}.\n\nFirst, tell me what you have tried so far. A useful next step is to identify exactly what the question is asking, list the information you know, and choose one small operation or evidence check.\n\nFor your question — "${message.slice(0, 120)}${message.length > 120 ? "…" : ""}" — try writing one sentence that names the skill being tested. Send me that sentence and your first attempt, and I'll give you a hint before a full solution.`;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

async function callOpenAI(apiKey: string, system: string, history: ChatMessage[]): Promise<string> {
  const body = JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      ...history,
    ],
    temperature: 0.4,
  });

  // Use undici (built into Node 18+) directly — avoids Next.js fetch patching entirely
  const { fetch: undiciFetch } = await import("undici");

  const res = await undiciFetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body,
  });

  const data = await res.json() as { choices?: { message?: { content?: string } }[]; error?: { message: string } };

  if (data.error) throw new Error(`OpenAI: ${data.error.message}`);
  return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.role === "student") {
      const accessLevel = await getStudentAccessLevel(session.email);
      if (accessLevel !== "unlocked") {
        return NextResponse.json({ error: "Full access required" }, { status: 403 });
      }
    }

    const { mode, messages, sessionId } = await request.json();

    if (!mode || !messages?.length) {
      return NextResponse.json({ error: "Mode and messages are required" }, { status: 400 });
    }

    const lastUserMsg = [...messages].reverse().find((m: ChatMessage) => m.role === "user")?.content ?? "";
    let response = mock(mode, lastUserMsg);

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const text = await callOpenAI(apiKey, `${rules}\nCurrent mode: ${mode}`, messages);
        if (text) response = text;
      } catch (openaiErr) {
        const e = openaiErr as Error;
        console.error("OpenAI error:", e.message ?? String(openaiErr));
      }
    } else {
      console.warn("OPENAI_API_KEY not set");
    }

    sendToN8n(process.env.N8N_AI_TUTOR_LOGGING_WEBHOOK_URL, {
      mode,
      messageLength: lastUserMsg.length,
      createdAt: new Date().toISOString(),
    }).catch(console.error);

    // Track AI tutor session (non-fatal)
    if (sessionId && session.role === "student") {
      try {
        await ensureAnalyticsTables();
        const userRows = await sql`SELECT id FROM users WHERE email = ${session.email} LIMIT 1`;
        const studentId = (userRows[0] as { id: string } | undefined)?.id;
        if (studentId) {
          await sql`
            INSERT INTO ai_tutor_sessions (id, student_id, started_at, message_count)
            VALUES (${sessionId}, ${studentId}, NOW(), ${messages.length})
            ON CONFLICT (id) DO UPDATE SET message_count = ${messages.length}, ended_at = NOW()
          `;
        }
      } catch (trackErr) {
        console.error("AI session tracking failed (non-fatal):", trackErr);
      }
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI tutor failed:", String(error));
    return NextResponse.json({
      response:
        "I'm having trouble connecting right now. Try breaking the problem into known information, the question being asked, and one possible first step. A human tutor can also help if you remain stuck.",
    });
  }
}
