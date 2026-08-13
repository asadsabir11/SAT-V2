"use client";
import { useEffect, useState, useCallback } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { DisclaimerBanner, PageHero } from "@/components/site";
import { UnlockModal, LockedBanner, type AccessLevel } from "@/components/unlock-modal";

export default function AITutor() {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("free");
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);

  const load = useCallback(() => {
    fetch("/api/student/me")
      .then(r => r.json())
      .then(d => setAccessLevel(d.access_level ?? "free"))
      .catch(() => setAccessLevel("free"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const locked = accessLevel !== "unlocked";

  return (
    <>
      {showModal && (
        <UnlockModal
          accessLevel={accessLevel}
          onClose={() => setShowModal(false)}
          onSubmitted={() => { setAccessLevel("pending"); load(); }}
        />
      )}

      <PageHero eyebrow="AI tutor" title="Get unstuck without giving away the learning." backHref="/sat" backLabel="SAT toolkit">
        Ask for a hint, explanation, or step-by-step walkthrough. The tutor uses original examples and encourages an attempt before a full solution.
      </PageHero>

      <section className="section">
        <div className="container grid grid-2" style={{ alignItems: "start" }}>

          {/* Left: chat or locked state */}
          {loading ? (
            <div className="card"><p>Loading…</p></div>
          ) : locked ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 32px" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🤖</div>
              <h2 style={{ color: "#071b33", marginBottom: 8 }}>AI Tutor — Full Access Only</h2>
              <p style={{ color: "#6b7c93", marginBottom: 24, lineHeight: 1.6 }}>
                {accessLevel === "pending"
                  ? "Your payment is being verified. The AI tutor will unlock automatically once confirmed."
                  : "Unlock full access to chat with the AI tutor anytime — get hints, step-by-step explanations, and instant help between sessions."}
              </p>
              {accessLevel === "free" && (
                <button
                  onClick={() => setShowModal(true)}
                  style={{ padding: "12px 28px", background: "#155eef", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: ".95rem", cursor: "pointer" }}
                >
                  Unlock Full Access
                </button>
              )}
              {accessLevel === "pending" && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10 }}>
                  <span>⏳</span>
                  <span style={{ color: "#92400e", fontWeight: 700, fontSize: ".9rem" }}>Verification in progress</span>
                </div>
              )}
            </div>
          ) : (
            <ChatInterface />
          )}

          {/* Right: info cards */}
          <div>
            {locked && !loading && (
              <LockedBanner accessLevel={accessLevel} onUnlock={() => setShowModal(true)} />
            )}
            <DisclaimerBanner />
            <div className="card" style={{ marginTop: 20 }}>
              <h3>How this helps</h3>
              <ul>
                <li>Step-by-step explanations</li>
                <li>Hints before full solutions</li>
                <li>Original SAT-style examples only</li>
                <li>Study coaching between classes</li>
                <li>Human escalation when confusion repeats</li>
              </ul>
            </div>
            <div className="card" style={{ marginTop: 20 }}>
              <h3>What it does not do</h3>
              <p>It does not replace a teacher, guarantee a score, provide official policy, or reproduce copyrighted questions.</p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
