"use client";
import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
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

interface OLevelStudentData {
  studentName: string;
  country: string;
  city?: string;
  grade?: string;
  subject?: string;
}

const OLEVEL_MODULES = [
  { href: "/o-level/lectures", icon: "🎬", title: "Lectures", description: "Watch recorded lessons on demand, anytime.", accent: "#155eef", grad: "linear-gradient(135deg,#155eef,#18a999)", glow: "rgba(21,94,239,.35)" },
  { href: "/o-level/quizzes", icon: "📝", title: "Quizzes", description: "Practice with subject quizzes and track your best scores.", accent: "#7c3aed", grad: "linear-gradient(135deg,#7c3aed,#a855f7)", glow: "rgba(124,58,237,.35)" },
  { href: "/o-level/sessions", icon: "📅", title: "Live Sessions", description: "Join live classes and open office hours.", accent: "#059669", grad: "linear-gradient(135deg,#059669,#10b981)", glow: "rgba(5,150,105,.35)" },
  { href: "/o-level/past-papers", icon: "📄", title: "Past Papers", description: "Practice with past-paper style questions.", accent: "#ea580c", grad: "linear-gradient(135deg,#ea580c,#f59e0b)", glow: "rgba(234,88,12,.35)" },
];

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
  const [program, setProgram] = useState<"sat" | "o-level">("sat");
  const [student, setStudent] = useState<StudentData | null>(null);
  const [oLevelStudent, setOLevelStudent] = useState<OLevelStudentData | null>(null);
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
          const isOLevel = studentData.program === "o-level";
          setProgram(isOLevel ? "o-level" : "sat");
          if (isOLevel) {
            setOLevelStudent(studentData.student ?? null);
          } else {
            setStudent(studentData.student ?? null);
            setDiagnostic(studentData.diagnostic ?? null);
          }
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

  // Logged in but no lead profile yet (e.g. account created outside the normal registration flow)
  if (program === "o-level" ? !oLevelStudent : !student) {
    const displayName = sessionName?.split(" ")[0] ?? "there";
    return (
      <>
        <PageHero eyebrow="Student dashboard" title={`Welcome, ${displayName}.`}>
          {program === "o-level"
            ? "You are logged in. Browse subjects and start learning."
            : "You are logged in. Complete your diagnostic to populate your dashboard."}
        </PageHero>
        <section className="section">
          <div className="container">
            <div className="card" style={{ maxWidth: 480 }}>
              <h3>Get started</h3>
              {program === "o-level" ? (
                <>
                  <p>Browse O Level subjects, watch lessons, and join live sessions.</p>
                  <div className="actions">
                    <CTAButton href="/o-level">Browse O Level</CTAButton>
                  </div>
                </>
              ) : (
                <>
                  <p>Take the free diagnostic to see your baseline score and unlock your personalized study plan.</p>
                  <div className="actions">
                    <CTAButton href="/diagnostic">Take the free diagnostic</CTAButton>
                    <CTAButton href="/register" secondary>Complete registration</CTAButton>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

  if (program === "o-level" && oLevelStudent) {
    const firstName = oLevelStudent.studentName?.split(" ")[0] ?? sessionName?.split(" ")[0] ?? "Student";
    const subjects = oLevelStudent.subject ? oLevelStudent.subject.split(",").filter(Boolean) : [];

    return (
      <>
        <PageHero
          eyebrow="Student dashboard"
          title={`Welcome back, ${firstName}. Let's keep learning.`}
        >
          O Level{oLevelStudent.country ? ` · ${oLevelStudent.country}` : ""}
          {subjects.length > 0 ? ` · ${subjects.length} subject${subjects.length > 1 ? "s" : ""}` : ""}
        </PageHero>

        <section className="section soft">
          <div className="container">
            {announcements.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                {announcements.map((a, i) => (
                  <div key={a.id} className="fade-up" style={{
                    display: "flex", gap: 14, alignItems: "flex-start",
                    background: "linear-gradient(135deg,#fffbeb,#fff7ed)", border: "1.5px solid #fde68a",
                    borderRadius: 16, padding: "16px 20px", marginBottom: 10,
                    boxShadow: "0 4px 16px rgba(217,119,6,.08)",
                    animationDelay: `${i * 0.06}s`,
                  }}>
                    <span style={{
                      width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                      display: "grid", placeItems: "center", fontSize: "1.05rem",
                      background: "linear-gradient(135deg,#f59e0b,#ea580c)", boxShadow: "0 6px 16px rgba(234,88,12,.3)",
                    }}>📢</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 800, color: "#92400e", margin: "0 0 3px", fontSize: ".92rem" }}>{a.title}</p>
                      <p style={{ color: "#78350f", fontSize: ".85rem", margin: "0 0 4px", lineHeight: 1.5 }}>{a.body}</p>
                      <span style={{ color: "#b45309", fontSize: ".72rem", fontWeight: 700 }}>{timeAgo(a.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {subjects.length > 0 && (
              <div className="card fade-up" style={{ marginBottom: 24, background: "linear-gradient(135deg,#f0fdfa,#eff6ff)" }}>
                <div className="eyebrow">Your subjects</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {subjects.map(s => (
                    <span className="badge teal" key={s}>✓ {s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-3">
              {OLEVEL_MODULES.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className="module-card fade-up"
                  style={{ "--module-accent": m.accent, "--module-accent-grad": m.grad, "--module-glow": m.glow } as CSSProperties}
                >
                  <article className="card" style={{ height: "100%" }}>
                    <div className="module-icon">{m.icon}</div>
                    <h3>{m.title}</h3>
                    <p>{m.description}</p>
                    <span className="module-arrow" style={{ color: m.accent, fontWeight: 700, fontSize: ".85rem" }}>Open →</span>
                  </article>
                </Link>
              ))}
            </div>

            <div className="actions" style={{ marginTop: 24 }}>
              <CTAButton href="/o-level" secondary>Browse all O Level</CTAButton>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!student) return null;

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

          {/* Quick links */}
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <Link href="/quizzes" style={{ padding: "10px 20px", background: "#155eef", color: "#fff", borderRadius: 10, fontWeight: 800, fontSize: ".88rem", textDecoration: "none" }}>
              📝 Quizzes →
            </Link>
            <Link href="/ai-tutor" style={{ padding: "10px 20px", background: "#f5f3ff", color: "#6d28d9", border: "1.5px solid #ddd6fe", borderRadius: 10, fontWeight: 700, fontSize: ".88rem", textDecoration: "none" }}>
              🤖 AI Tutor →
            </Link>
            <Link href="/sessions" style={{ padding: "10px 20px", background: "#ecfdf5", color: "#065f46", border: "1.5px solid #a7f3d0", borderRadius: 10, fontWeight: 700, fontSize: ".88rem", textDecoration: "none" }}>
              📅 Sessions →
            </Link>
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
