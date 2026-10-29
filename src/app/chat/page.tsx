"use client";
import { useRef, useState } from "react";
import { PageHero, DisclaimerBanner } from "@/components/site";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const sessionId = useRef(crypto.randomUUID());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! Ask me anything about your course material and I'll do my best to help." },
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
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages, sessionId: sessionId.current }),
      });
      const data = await r.json();
      setMessages((m) => [...m, { role: "assistant", content: data.response }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "I hit a temporary connection issue. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHero eyebrow="AI Tutor" title="Ask a question">
        Get instant help based on your course material.
      </PageHero>

      <section className="section">
        <div className="container grid grid-2" style={{ alignItems: "start" }}>
          <div className="card">
            <div className="chat" aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={`bubble ${m.role}`} style={{ whiteSpace: "pre-wrap" }}>
                  {m.content}
                </div>
              ))}
              {loading && <div className="bubble assistant">Thinking…</div>}
            </div>

            <form className="chat-input" onSubmit={send}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                aria-label="Chat message"
                disabled={loading}
              />
              <button className="btn btn-primary" disabled={loading}>Send</button>
            </form>

            <div className="actions" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setMessages(messages.slice(0, 1))}>
                Clear chat
              </button>
            </div>
          </div>

          <div>
            <DisclaimerBanner />
            <div className="card" style={{ marginTop: 20 }}>
              <h3>What it does not do</h3>
              <p>It does not replace a teacher, guarantee a score or grade, or provide official exam-board policy.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
