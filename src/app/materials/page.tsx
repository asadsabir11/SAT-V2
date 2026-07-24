"use client";
import { PageHero } from "@/components/site";
import { useState } from "react";

const materials = [
  "Free diagnostic test",
  "Answer bubble sheet",
  "SAT study plan",
  "Mock Test 1",
  "Mock Test 2",
  "Mock Test 3",
  "Reading/Writing worksheet",
  "Math worksheet",
  "Parent guide",
  "Course syllabus",
];

function NotifyCard({ title, index }: { title: string; index: number }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    await fetch("/api/leads/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, material: title }),
    });
    setDone(true);
  }

  return (
    <article className="card">
      <div className="icon">{String(index + 1).padStart(2, "0")}</div>
      <h3>{title}</h3>
      <p>In preparation — enter your email and we&apos;ll notify you the moment it&apos;s ready.</p>
      {done ? (
        <p style={{ color: "#065f46", fontWeight: 700, fontSize: ".88rem", marginTop: 8 }}>✓ We&apos;ll let you know!</p>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            aria-label={`Email to be notified about ${title}`}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #d0d7e3", fontSize: ".85rem" }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: "8px 14px", fontSize: ".82rem", whiteSpace: "nowrap" }}>
            Notify me
          </button>
        </form>
      )}
    </article>
  );
}

export default function Materials() {
  return (
    <>
      <PageHero eyebrow="Preparation library" title="Simple materials. Used consistently.">
        Original resources will be released in stages for diagnostic, weekly practice, mock testing, parent support, and cohort delivery.
      </PageHero>
      <section className="section soft">
        <div className="container grid grid-3">
          {materials.map((x, i) => <NotifyCard key={x} title={x} index={i} />)}
        </div>
      </section>
    </>
  );
}
