"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Message = { role: "user" | "assistant"; content: string };

export function ChatInterface() {
  const mode = "SAT Tutor";
  const router = useRouter();
  const sessionId = useRef(crypto.randomUUID());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! Choose a tutor mode and tell me what you're working on. I'll guide you step by step, starting with what you already know." },
  ]);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input;
    setInput("");
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const r = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, messages: next, sessionId: sessionId.current }),
      });
      const data = await r.json();
      setMessages(m => [...m, { role: "assistant", content: data.response }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "I hit a temporary connection issue. Try again, or escalate this question to a human tutor." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="chat" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`} style={{ whiteSpace: "pre-wrap" }}>
            {m.content}
          </div>
        ))}
        {loading && <div className="bubble assistant">Thinking through the next helpful step…</div>}
      </div>

      <form className="chat-input" onSubmit={send}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question or paste an original practice problem…"
          aria-label="Tutor message"
        />
        <button className="btn btn-primary">Send</button>
      </form>

      <div className="actions" style={{ justifyContent: "space-between" }}>
        <button type="button" className="btn btn-secondary" onClick={() => setMessages(messages.slice(0, 1))}>
          Clear chat
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.push("/discussion")}>Escalate to human tutor</button>
      </div>
    </div>
  );
}
