import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findByField } from "@/lib/storage";
import { subjectsForStudyGroup, subjectSlugToLabel } from "@/lib/punjab9thSessions";
import { getPunjab9thAccessLevel } from "@/lib/punjab9thAccess";
import { getPublishedPunjab9thQuizzesBySubject } from "@/lib/punjab9thQuiz";

interface Punjab9thLead { studyGroup: string; }

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Split out of the subject page — that page used to show the full quiz list
// inline, now it just links here via a summary card. Auth/subject validation
// duplicated from [subject]/page.tsx rather than shared, matching how the
// rest of this program's portal pages each redo their own checks.
export default async function Punjab9thSubjectQuizzesPage({ params }: { params: Promise<{ subject: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "punjab-9th") {
    redirect("/login?role=student&program=punjab-9th&next=/punjab-board-9th-class/portal");
  }

  const { subject: slug } = await params;
  const subject = subjectSlugToLabel(slug);
  const lead = await findByField<Punjab9thLead>("leads-punjab-9th.json", "studentEmail", session!.email);
  const group = lead?.studyGroup ?? "Biology";

  if (!subject || !subjectsForStudyGroup(group).includes(subject)) {
    notFound();
  }

  const accessLevel = await getPunjab9thAccessLevel(session!.email);
  const unlocked = accessLevel === "unlocked";
  if (!unlocked) {
    redirect(`/punjab-board-9th-class/portal/${slug}`);
  }

  const quizzes = await getPublishedPunjab9thQuizzesBySubject(subject);

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <Link href={`/punjab-board-9th-class/portal/${slug}`} style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none" }}>← {subject}</Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "10px 0 24px" }}>{subject} — Quizzes</h1>

        {quizzes.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>📝</div>
            <p style={{ fontWeight: 700 }}>No quizzes yet</p>
            <p style={{ fontSize: ".88rem" }}>Check back soon — quizzes are added regularly.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {quizzes.map((q) => (
              <Link key={q.id} href={`/punjab-board-9th-class/portal/quiz/${q.id}`} className="card" style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                <div className="eyebrow">📝 {q.question_count} question{q.question_count === 1 ? "" : "s"}</div>
                <h3 style={{ margin: 0, color: "#071b33" }}>{q.title}</h3>
                {q.description && <p style={{ margin: 0, color: "#6b7c93", fontSize: ".85rem" }}>{q.description}</p>}
                <span style={{ marginTop: "auto", fontWeight: 700, fontSize: ".85rem", color: "#155eef" }}>Start quiz →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
