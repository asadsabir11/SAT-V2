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

export default function Dashboard() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasEmail, setHasEmail] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("sat_student_email");
    if (!email) { setLoading(false); return; }
    setHasEmail(true);
    fetch(`/api/student?email=${encodeURIComponent(email)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setStudent(data.student);
          setDiagnostic(data.diagnostic ?? null);
        }
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

  if (!hasEmail || !student) {
    return (
      <>
        <PageHero eyebrow="Student dashboard" title="Your personalized dashboard awaits.">
          Register to track your diagnostic score, study plan, and progress.
        </PageHero>
        <section className="section">
          <div className="container">
            <div className="card" style={{ maxWidth: 480 }}>
              <h3>Get started</h3>
              <p>Register as a student to access your personal dashboard, or take the diagnostic to see your baseline score.</p>
              <div className="actions">
                <CTAButton href="/register">Register now</CTAButton>
                <CTAButton href="/diagnostic" secondary>Take the free diagnostic</CTAButton>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  const firstName = student.studentName?.split(" ")[0] ?? "Student";
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
        {student.packageType} · {student.country} · Current cohort: Global SAT Founder 01
      </PageHero>
      <section className="section soft">
        <div className="container">
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
