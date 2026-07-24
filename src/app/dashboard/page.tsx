"use client";
import { useEffect, useState } from "react";
import { CTAButton, DashboardCard, PageHero } from "@/components/site";

interface DiagnosticResult {
  mathScore: number;
  rwScore: number;
  totalScore: number;
  weakAreas: string[];
  createdAt: string;
}

interface StudentData {
  studentName: string;
  country: string;
  packageType: string;
  targetScore?: string;
  grade?: string;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Dashboard() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/student/me").then(r => {
        if (r.status === 401) { setUnauthorized(true); return null; }
        return r.ok ? r.json() : null;
      }),
      fetch("/api/announcements").then(r => r.ok ? r.json() : { announcements: [] }),
    ])
      .then(([studentData, annData]) => {
        if (studentData) {
          setStudent(studentData.student ?? null);
          setDiagnostic(studentData.diagnostic ?? null);
          setSessionName(studentData.name ?? null);
        }
        setAnnouncements(annData.announcements ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="card" style={{ maxWidth: 400 }}>
            <p>Loading your dashboard…</p>
          </div>
        </div>
      </section>
    );
  }

  if (unauthorized) {
    return (
      <>
        <PageHero eyebrow="Student dashboard" title="Sign in to view your dashboard.">
          Your progress, diagnostic score, and study plan are waiting.
        </PageHero>
        <section className="section">
          <div className="container">
            <div className="card" style={{ maxWidth: 480 }}>
              <h3>You need to be signed in</h3>
              <p>Please sign in with your student account to access your dashboard.</p>
              <div className="actions">
                <CTAButton href="/login?role=student">Sign in</CTAButton>
                <CTAButton href="/register" secondary>Register now</CTAButton>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Logged in but no student profile yet (e.g. registered via auth but no lead record)
  if (!student) {
    const displayName = sessionName?.split(" ")[0] ?? "there";
    return (
      <>
        <PageHero eyebrow="Student dashboard" title={`Welcome, ${displayName}.`}>
          You are logged in. Complete your diagnostic to populate your dashboard.
        </PageHero>
        <section className="section">
          <div className="container">
            <div className="card" style={{ maxWidth: 480 }}>
              <h3>Get started</h3>
              <p>Take the free diagnostic to see your baseline score and unlock your personalized study plan.</p>
              <div className="actions">
                <CTAButton href="/diagnostic">Take the free diagnostic</CTAButton>
                <CTAButton href="/register" secondary>Complete registration</CTAButton>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  const firstName = student.studentName?.split(" ")[0] ?? sessionName?.split(" ")[0] ?? "Student";
  const target = student.targetScore ? Number(student.targetScore) : null;
  const diagScore = diagnostic?.totalScore ?? null;
  const pointsNeeded = diagScore && target ? target - diagScore : null;
  const weakAreas = diagnostic?.weakAreas ?? [];
  const topWeak = weakAreas[0] ?? null;

  return (
    <>
      <PageHero
        eyebrow="Student dashboard"
        title={`Welcome back, ${firstName}. Your next win is specific.`}
      >
        {student.packageType} · {student.country} · Current cohort: Global SAT 01
      </PageHero>

      <section className="section soft">
        <div className="container">

          {/* Announcements */}
          {announcements.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              {announcements.map(a => (
                <div key={a.id} style={{
                  display: "flex", gap: 14, alignItems: "flex-start",
                  background: "#fffbeb", border: "1.5px solid #fde68a",
                  borderRadius: 12, padding: "14px 18px", marginBottom: 10,
                }}>
                  <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>📢</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, color: "#92400e", margin: "0 0 3px", fontSize: ".92rem" }}>{a.title}</p>
                    <p style={{ color: "#78350f", fontSize: ".85rem", margin: "0 0 4px", lineHeight: 1.5 }}>{a.body}</p>
                    <span style={{ color: "#b45309", fontSize: ".72rem" }}>{timeAgo(a.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-4">
            <DashboardCard
              label="Diagnostic score"
              value={diagScore ? String(diagScore) : "—"}
              detail={diagScore ? "Your starting baseline" : "Take diagnostic to see score"}
            />
            <DashboardCard
              label="Target score"
              value={target ? String(target) : "—"}
              detail="Your working goal"
            />
            <DashboardCard
              label="Points needed"
              value={pointsNeeded !== null ? `+${pointsNeeded}` : "—"}
              detail="To reach your target"
            />
            <DashboardCard
              label="Weak areas"
              value={weakAreas.length > 0 ? String(weakAreas.length) : "—"}
              detail={weakAreas.length > 0 ? "From diagnostic" : "Complete diagnostic first"}
            />
          </div>

          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <div className="card">
              <div className="eyebrow">Next recommended action</div>
              <h2 style={{ fontSize: "1.8rem", color: "#071b33" }}>
                {diagScore
                  ? topWeak
                    ? `Focus on: ${topWeak}`
                    : "Practice with the AI Tutor"
                  : "Complete your free diagnostic test"}
              </h2>
              <p>
                {diagScore
                  ? topWeak
                    ? `Based on your diagnostic, ${topWeak} is your highest-leverage improvement area.`
                    : "Great diagnostic score! Keep practicing with the AI tutor to push further."
                  : "The diagnostic identifies your starting point and the exact skills to prioritize first."}
              </p>
              <div className="actions">
                {diagScore ? (
                  <CTAButton href="/ai-tutor">Open AI tutor</CTAButton>
                ) : (
                  <CTAButton href="/diagnostic">Take the diagnostic</CTAButton>
                )}
                <CTAButton href="/materials" secondary>View study materials</CTAButton>
              </div>
            </div>

            <div className="card">
              <h3>Diagnostic breakdown</h3>
              {diagnostic ? (
                <>
                  <p><strong>Math:</strong> {diagnostic.mathScore} / 800</p>
                  <p><strong>Reading &amp; Writing:</strong> {diagnostic.rwScore} / 800</p>
                  <p><strong>Total:</strong> {diagnostic.totalScore} / 1600</p>
                  {weakAreas.length > 0 && (
                    <p><strong>Areas to improve:</strong> {weakAreas.join(", ")}</p>
                  )}
                  <p style={{ color: "#6b7c93", fontSize: 13, marginTop: 8 }}>
                    Taken {new Date(diagnostic.createdAt).toLocaleDateString()}
                  </p>
                  <div className="actions" style={{ marginTop: 12 }}>
                    <CTAButton href="/diagnostic" secondary>Retake diagnostic</CTAButton>
                  </div>
                </>
              ) : (
                <>
                  <p>You haven&apos;t completed the diagnostic yet. It takes about 15 minutes and gives you a precise starting score.</p>
                  <div className="actions">
                    <CTAButton href="/diagnostic">Take diagnostic now</CTAButton>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
