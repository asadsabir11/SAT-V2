"use client";
import { useState } from "react";

interface Punjab9thSession {
  id: string;
  subject: string;
  title: string;
  meeting_link: string;
  scheduled_at: string;
}

const SUBJECT_ORDER = ["English", "Urdu", "Maths", "Physics", "Chemistry", "Biology", "Computer Science", "Islamiat", "Tarjuma-tul-Quran or Ethics"];

function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function Punjab9thClassSchedule({ sessions }: { sessions: Punjab9thSession[] }) {
  const subjects = SUBJECT_ORDER.filter((s) => sessions.some((sess) => sess.subject === s));
  const [activeTab, setActiveTab] = useState<string>("All");

  if (sessions.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 32, color: "#6b7c93" }}>
        <p style={{ fontWeight: 700 }}>No classes scheduled yet</p>
        <p style={{ fontSize: ".88rem" }}>Class timings will appear here once your batch schedule is set — we&apos;ll also message your parent on WhatsApp.</p>
      </div>
    );
  }

  const visible = activeTab === "All" ? sessions : sessions.filter((s) => s.subject === activeTab);

  return (
    <div>
      {/* Subject tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {["All", ...subjects].map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer",
                border: active ? "2px solid #155eef" : "2px solid #e8eef6",
                background: active ? "#eff6ff" : "#fff",
                color: active ? "#155eef" : "#6b7c93",
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Class cards — the whole card opens the Zoom link */}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {visible.map((s) => (
          <a
            key={s.id}
            href={s.meeting_link}
            target="_blank"
            rel="noreferrer"
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: 10, padding: "18px 20px", textDecoration: "none", transition: "transform .15s, box-shadow .15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(7,27,51,.10)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <span style={{ alignSelf: "flex-start", padding: "3px 12px", borderRadius: 999, fontSize: ".72rem", fontWeight: 800, background: "#eff6ff", color: "#155eef" }}>
              {s.subject}
            </span>
            <span style={{ fontWeight: 900, color: "#071b33", fontSize: "1rem" }}>{s.title}</span>
            <span style={{ fontSize: ".85rem", color: "#6b7c93" }}>{fmtWhen(s.scheduled_at)}</span>
            <span style={{ marginTop: "auto", paddingTop: 6, fontWeight: 700, fontSize: ".85rem", color: "#155eef" }}>Join Zoom →</span>
          </a>
        ))}
      </div>
    </div>
  );
}
