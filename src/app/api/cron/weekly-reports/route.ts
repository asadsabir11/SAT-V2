import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { buildReportMetrics, saveReport, updateReportFields, ensureParentTables } from "@/lib/parent-system";
import { generateReportNarrative, getAITutorUsage } from "@/lib/analytics";

// Weekly draft generation (Vercel cron, see vercel.json). Aggregates each
// student's real metrics into a draft report and pre-writes the AI narrative.
// Drafts stay invisible to parents until the founder approves them in
// /admin/reports, so a bad narrative can never reach a parent unreviewed.
export async function GET(request: NextRequest) {
  const secret = (process.env.CRON_SECRET ?? "").trim();
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startRaw = (process.env.COHORT_START_DATE ?? "").trim();
  const cohortStart = startRaw ? new Date(startRaw) : null;
  if (!cohortStart || isNaN(cohortStart.getTime())) {
    return NextResponse.json({
      ok: false,
      skipped: "COHORT_START_DATE not set (e.g. 2026-08-03). No reports generated.",
    });
  }

  const now = new Date();
  const weekNo = Math.max(1, Math.floor((now.getTime() - cohortStart.getTime()) / (7 * 24 * 3600 * 1000)) + 1);
  const periodEnd = now.toISOString().slice(0, 10);
  const periodStart = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  await ensureParentTables();
  const students = await sql`SELECT id, name FROM users WHERE role = 'student' ORDER BY name`;

  const results: { student: string; status: string }[] = [];
  for (const s of students as { id: string; name: string }[]) {
    try {
      // Don't regenerate a week the founder has already approved or sent.
      const existing = await sql`
        SELECT id FROM parent_reports
        WHERE student_id = ${s.id} AND week_no = ${weekNo} AND status IN ('approved','sent')
        LIMIT 1
      `;
      if (existing.length > 0) {
        results.push({ student: s.name, status: "already approved/sent" });
        continue;
      }

      const metrics = await buildReportMetrics(s.id, weekNo, periodStart, periodEnd);
      const reportId = await saveReport(s.id, weekNo, periodStart, periodEnd, metrics, "", "");

      const aiUsage = await getAITutorUsage(s.id, periodStart);
      const narrative = await generateReportNarrative({
        studentName:      metrics.student,
        weekNo,
        attendanceStatus: metrics.attendance.status,
        homeworkDone:     metrics.homework.done,
        homeworkTotal:    metrics.homework.assigned,
        aiSessions:       metrics.practice.aiSessions,
        aiHours:          Number(aiUsage.total_hours ?? 0),
        latestScore:      metrics.score.latestMock,
        targetScore:      metrics.score.target,
        scoreDelta:       metrics.score.deltaSinceLast,
        strengths:        metrics.strengths,
        focusAreas:       metrics.focusAreas,
        coachNote:        "",
      });
      await updateReportFields(reportId, "", "", narrative);
      results.push({ student: s.name, status: "draft created" });
    } catch (e) {
      results.push({ student: s.name, status: `error: ${String(e)}` });
    }
  }

  return NextResponse.json({ ok: true, weekNo, periodStart, periodEnd, results });
}
