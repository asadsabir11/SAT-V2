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

// Client input is untrusted: keep only well-shaped {role, content} pairs,
// cap history length/size so a malicious or buggy client can't blow up the
// payload we forward to n8n.
function sanitizeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ipAllowed = await checkRateLimit(`chat:${clientIp(request)}`, 30, 60);
    if (!ipAllowed) {
      return NextResponse.json({ error: "Too many messages. Please slow down and try again shortly." }, { status: 429 });
    }
    const studentAllowed = await checkRateLimit(`chat:student:${session.id}`, 10, 1);
    if (!studentAllowed) {
      return NextResponse.json({ error: "Too many messages. Please slow down and try again shortly." }, { status: 429 });
    }

    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 2000) : "";
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    const history = sanitizeHistory(body?.history);
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : undefined;

    let response = placeholderReply();
    const webhookUrl = process.env.N8N_CHAT_URL;
    if (webhookUrl) {
      try {
        // program/email/name come from the authenticated session, never from
        // the request body — the client can't impersonate another program
        // or student by sending a different value.
        const data = await sendToN8n(webhookUrl, {
          program: session.program ?? "sat",
          email: session.email,
          name: session.name,
          message,
          history,
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
          const messageCount = history.length + 1;
          await sql`
            INSERT INTO ai_tutor_sessions (id, student_id, started_at, message_count)
            VALUES (${sessionId}, ${studentId}, NOW(), ${messageCount})
            ON CONFLICT (id) DO UPDATE SET message_count = ${messageCount}, ended_at = NOW()
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
