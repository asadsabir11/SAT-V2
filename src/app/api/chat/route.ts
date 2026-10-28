import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendToN8n } from "@/lib/n8n";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { ensureAnalyticsTables } from "@/lib/analytics";
import { sql } from "@/lib/db";

// Shared across every program (SAT, O-Level, Punjab-9th, A-Level) — one
// chatbot, not four. The actual answer comes entirely from n8n (which does
// PDF-based retrieval per program/subject); this route just relays the
// message and student context, and never talks to an LLM directly.
type ChatMessage = { role: "user" | "assistant"; content: string };

function placeholderReply(): string {
  return "The chatbot isn't connected yet — once it's configured, I'll answer using your course notes. In the meantime, try asking your teacher or check the lecture materials.";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowed = await checkRateLimit(`chat:${clientIp(request)}`, 30, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Too many messages. Please slow down and try again shortly." }, { status: 429 });
    }

    const { messages, sessionId } = await request.json();
    if (!messages?.length) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const lastUserMsg = [...messages].reverse().find((m: ChatMessage) => m.role === "user")?.content ?? "";

    let response = placeholderReply();
    const webhookUrl = process.env.N8N_CHATBOT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const data = await sendToN8n(webhookUrl, {
          program: session.program ?? "sat",
          email: session.email,
          name: session.name,
          message: lastUserMsg,
          history: messages as ChatMessage[],
        }) as { response?: string };
        if (data?.response) response = data.response;
      } catch (n8nErr) {
        console.error("n8n chatbot error:", (n8nErr as Error).message ?? String(n8nErr));
      }
    }

    // Reuses the same session-tracking table the old SAT-only AI tutor used
    // (ai_tutor_sessions) — it was already program-agnostic in shape
    // (student_id, message_count), just never fed by anything but SAT.
    if (sessionId) {
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
        console.error("Chat session tracking failed (non-fatal):", trackErr);
      }
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat failed:", String(error));
    return NextResponse.json({ response: "I'm having trouble connecting right now. Please try again in a moment." });
  }
}
