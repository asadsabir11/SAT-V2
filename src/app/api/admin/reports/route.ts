import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  buildReportMetrics, saveReport, updateReportStatus,
  listAllReports, getReportById, updateReportFields
} from "@/lib/parent-system";
import { sendParentReport } from "@/lib/email";
import { generateReportNarrative, getAITutorUsage } from "@/lib/analytics";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL!);

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (id) {
    const report = await getReportById(id);
    return NextResponse.json({ report });
  }

  const [reports, students] = await Promise.all([
    listAllReports(),
    sql`SELECT id, name, email FROM users WHERE role = 'student' ORDER BY name`,
  ]);
  return NextResponse.json({ reports, students });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Generate a new report
  if (body.action === "generate") {
    const { studentId, weekNo, periodStart, periodEnd } = body;
    if (!studentId || !weekNo || !periodStart || !periodEnd) {
      return NextResponse.json({ error: "studentId, weekNo, periodStart, periodEnd required" }, { status: 400 });
    }
    const metrics = await buildReportMetrics(studentId, Number(weekNo), periodStart, periodEnd);
    const id = await saveReport(studentId, Number(weekNo), periodStart, periodEnd, metrics, "", "");
    return NextResponse.json({ ok: true, id, metrics });
  }

  // Generate AI narrative for a report
  if (body.action === "generate_narrative") {
    const { id } = body;
    const report = await getReportById(id);
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    const m = report.metrics_json as {
      student: string; week: number;
      attendance: { status: string };
      homework: { done: number; assigned: number };
      practice: { aiSessions: number };
      score: { latestMock: number | null; target: number | null; deltaSinceLast: number | null };
      strengths: string[];
      focusAreas: string[];
    };

    const aiUsage = await getAITutorUsage(report.student_id as string);

    const narrative = await generateReportNarrative({
      studentName:      m.student,
      weekNo:           m.week,
      attendanceStatus: m.attendance?.status ?? "not recorded",
      homeworkDone:     m.homework?.done ?? 0,
      homeworkTotal:    m.homework?.assigned ?? 0,
      aiSessions:       m.practice?.aiSessions ?? Number(aiUsage.session_count ?? 0),
      aiHours:          Number(aiUsage.total_hours ?? 0),
      latestScore:      m.score?.latestMock ?? null,
      targetScore:      m.score?.target ?? null,
      scoreDelta:       m.score?.deltaSinceLast ?? null,
      strengths:        m.strengths ?? [],
      focusAreas:       m.focusAreas ?? [],
      coachNote:        String(report.coach_note ?? ""),
    });

    await updateReportFields(id, String(report.coach_note ?? ""), String(report.parent_action ?? ""), narrative);
    return NextResponse.json({ ok: true, narrative });
  }

  // Update coach note & parent action
  if (body.action === "update") {
    const { id, coachNote, parentAction } = body;
    await updateReportFields(id, coachNote ?? "", parentAction ?? "");
    await updateReportStatus(id, "approved");
    return NextResponse.json({ ok: true });
  }

  // Send report via email + generate WhatsApp link
  if (body.action === "send") {
    const { id } = body;
    const report = await getReportById(id);
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    // Get parent email via parent_student_links
    const parentLinks = await sql`
      SELECT u.email AS parent_email, u.name AS parent_name
      FROM parent_student_links psl
      JOIN users u ON u.id = psl.parent_user_id
      WHERE psl.student_id = ${report.student_id}
      LIMIT 1
    `;

    const metrics = report.metrics_json as {
      student: string; week: number;
      attendance: { status: string };
      homework: { done: number; assigned: number };
      score: { latestMock: number | null; target: number | null; deltaSinceLast: number | null };
      strengths: string[];
      focusAreas: string[];
    };

    let emailResult: { ok: boolean; error?: string } = { ok: false, error: "No parent email linked" };
    let waLink = "";

    if (parentLinks.length > 0) {
      const pl = parentLinks[0] as { parent_email: string; parent_name: string };
      emailResult = await sendParentReport({
        parentEmail:      pl.parent_email,
        parentName:       pl.parent_name,
        studentName:      metrics.student,
        weekNo:           metrics.week,
        attendanceStatus: metrics.attendance?.status ?? "not recorded",
        homeworkDone:     metrics.homework?.done ?? 0,
        homeworkTotal:    metrics.homework?.assigned ?? 0,
        latestScore:      metrics.score?.latestMock ?? null,
        targetScore:      metrics.score?.target ?? null,
        scoreDelta:       metrics.score?.deltaSinceLast ?? null,
        strengths:        metrics.strengths ?? [],
        focusAreas:       metrics.focusAreas ?? [],
        coachNote:        String(report.coach_note ?? ""),
        parentAction:     String(report.parent_action ?? ""),
      });

      // WhatsApp message (formatted for wa.me)
      const msg = [
        `📊 *Week ${metrics.week} Report — ${metrics.student}*`,
        ``,
        `✅ Attendance: ${metrics.attendance?.status ?? "not recorded"}`,
        `📚 Homework: ${metrics.homework?.done ?? 0}/${metrics.homework?.assigned ?? 0} done`,
        metrics.score?.latestMock ? `📈 Score: ${metrics.score.latestMock}${metrics.score.deltaSinceLast != null ? ` (${metrics.score.deltaSinceLast >= 0 ? "+" : ""}${metrics.score.deltaSinceLast})` : ""}` : null,
        metrics.strengths?.length ? `💪 Strengths: ${metrics.strengths.join(", ")}` : null,
        metrics.focusAreas?.length ? `⚡ Focus: ${metrics.focusAreas.join(", ")}` : null,
        ``,
        report.coach_note ? `Coach: "${report.coach_note}"` : null,
        report.parent_action ? `⭐ Your action: ${report.parent_action}` : null,
        ``,
        `Full report: https://digital-tutor-sat-prep.vercel.app/parent`,
      ].filter(Boolean).join("\n");

      waLink = `https://wa.me/${encodeURIComponent(pl.parent_email.replace(/\D/g, ""))}?text=${encodeURIComponent(msg)}`;
    }

    if (emailResult.ok) {
      await updateReportStatus(id, "sent");
    }

    return NextResponse.json({ ok: emailResult.ok, emailResult, waLink });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
