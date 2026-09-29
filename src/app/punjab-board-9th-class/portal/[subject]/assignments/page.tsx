import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findByField } from "@/lib/storage";
import { subjectsForStudyGroup, subjectSlugToLabel } from "@/lib/punjab9thSessions";
import { getPunjab9thAccessLevel } from "@/lib/punjab9thAccess";
import { getPublishedAssignments, getSubmissionForStudent } from "@/lib/punjab9thAssignments";

interface Punjab9thLead { studyGroup: string; }

export const metadata: Metadata = { robots: { index: false, follow: false } };

function fmtDue(d: string | null) {
  if (!d) return "No due date";
  return new Date(d).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
}

function statusFor(a: { due_at: string | null; max_marks: number | null }, submission: { is_late: boolean; marks: number | null } | null): { label: string; icon: string; bg: string; color: string; border: string } {
  if (submission?.marks !== null && submission?.marks !== undefined) {
    return { label: `Graded — ${submission.marks}${a.max_marks ? `/${a.max_marks}` : ""}`, icon: "🌟", bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" };
  }
  if (submission) {
    return submission.is_late
      ? { label: "Turned in late", icon: "⚠️", bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" }
      : { label: "Turned in", icon: "✅", bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" };
  }
  const overdue = a.due_at ? Date.now() > new Date(a.due_at).getTime() : false;
  return overdue
    ? { label: "Missing", icon: "❗", bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" }
    : { label: "Assigned", icon: "🕐", bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
}

// Split out of the subject page like Lectures/Quizzes — auth/subject
// validation duplicated rather than shared, matching this program's
// existing convention. Access here is flat (getPunjab9thAccessLevel), not
// per-subject, so once unlocked a student sees every subject's assignments.
export default async function Punjab9thSubjectAssignmentsPage({ params }: { params: Promise<{ subject: string }> }) {
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

  const assignments = (await getPublishedAssignments()).filter((a) => a.category === slug);
  const withSubmissions = await Promise.all(
    assignments.map(async (a) => ({ ...a, my_submission: await getSubmissionForStudent(a.id, session!.email) }))
  );

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <Link href={`/punjab-board-9th-class/portal/${slug}`} style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none" }}>← {subject}</Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "10px 0 24px" }}>{subject} — Assignments</h1>

        {withSubmissions.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>📋</div>
            <p style={{ fontWeight: 700 }}>No assignments yet</p>
            <p style={{ fontSize: ".88rem" }}>Check back soon — assignments are added regularly.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {withSubmissions.map((a) => {
              const status = statusFor(a, a.my_submission);
              return (
                <Link key={a.id} href={`/punjab-board-9th-class/portal/${slug}/assignments/${a.id}`} style={{ textDecoration: "none" }}>
                  <div className="card" style={{ padding: "16px 20px", display: "flex", gap: 14, alignItems: "center", borderLeft: `4px solid ${status.border}` }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem", background: status.bg }}>
                      {status.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 4px", fontSize: ".95rem" }}>{a.title}</p>
                      <p style={{ color: "#94a3b8", fontSize: ".8rem", margin: 0 }}>Due: {fmtDue(a.due_at)}</p>
                    </div>
                    <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: ".72rem", fontWeight: 800, background: status.bg, color: status.color, flexShrink: 0, whiteSpace: "nowrap" }}>
                      {status.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
