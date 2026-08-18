import { sql } from "@/lib/db";
import { getAITutorUsage, getStrengthsAndFocus } from "@/lib/analytics";
import { getSubjectPerformanceForStudent } from "@/lib/olevel-quiz";
import { getOLevelAccessMap } from "@/lib/olevelAccess";
import { getSubject } from "@/lib/academy/data";


let ready = false;
export async function ensureParentTables() {
  if (ready) return;

  await sql`
    CREATE TABLE IF NOT EXISTS parent_student_links (
      id            TEXT PRIMARY KEY,
      parent_user_id TEXT NOT NULL,
      student_id    TEXT NOT NULL,
      relationship  TEXT DEFAULT 'parent',
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (parent_user_id, student_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS assignments (
      id         TEXT PRIMARY KEY,
      week_no    INTEGER NOT NULL,
      title      TEXT NOT NULL,
      due_at     TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS homework_submissions (
      id            TEXT PRIMARY KEY,
      student_id    TEXT NOT NULL,
      assignment_id TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','done','missed')),
      completed_at  TIMESTAMPTZ,
      UNIQUE (student_id, assignment_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS session_attendance (
      id         TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'absent' CHECK (status IN ('present','late','absent')),
      marked_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (student_id, session_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS parent_reports (
      id           TEXT PRIMARY KEY,
      student_id   TEXT NOT NULL,
      week_no      INTEGER NOT NULL,
      period_start DATE NOT NULL,
      period_end   DATE NOT NULL,
      metrics_json JSONB NOT NULL,
      narrative    TEXT,
      coach_note   TEXT,
      parent_action TEXT,
      status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','sent')),
      sent_at      TIMESTAMPTZ,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  ready = true;
}

// ─── Parent-Student Links ─────────────────────────────────────────────────────

export async function linkParentToStudent(parentUserId: string, studentId: string) {
  await ensureParentTables();
  await sql`
    INSERT INTO parent_student_links (id, parent_user_id, student_id)
    VALUES (${crypto.randomUUID()}, ${parentUserId}, ${studentId})
    ON CONFLICT (parent_user_id, student_id) DO NOTHING
  `;
}

export async function getStudentForParent(parentUserId: string) {
  await ensureParentTables();
  const rows = await sql`
    SELECT u.id, u.name, u.email, u.program
    FROM parent_student_links psl
    JOIN users u ON u.id = psl.student_id
    WHERE psl.parent_user_id = ${parentUserId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function listParentLinks() {
  await ensureParentTables();
  const rows = await sql`
    SELECT
      psl.id, psl.created_at,
      p.id   AS parent_id,   p.name AS parent_name,   p.email AS parent_email,
      s.id   AS student_id,  s.name AS student_name,  s.email AS student_email
    FROM parent_student_links psl
    JOIN users p ON p.id = psl.parent_user_id
    JOIN users s ON s.id = psl.student_id
    ORDER BY psl.created_at DESC
  `;
  return rows;
}

export async function deleteParentLink(id: string) {
  await ensureParentTables();
  await sql`DELETE FROM parent_student_links WHERE id = ${id}`;
}

// ─── Assignments & Homework ───────────────────────────────────────────────────

export async function createAssignment(weekNo: number, title: string, dueAt?: string) {
  await ensureParentTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO assignments (id, week_no, title, due_at)
    VALUES (${id}, ${weekNo}, ${title}, ${dueAt ?? null})
  `;
  return id;
}

export async function listAssignments(weekNo?: number) {
  await ensureParentTables();
  const rows = weekNo !== undefined
    ? await sql`SELECT * FROM assignments WHERE week_no = ${weekNo} ORDER BY created_at`
    : await sql`SELECT * FROM assignments ORDER BY week_no DESC, created_at DESC`;
  return rows;
}

export async function deleteAssignment(id: string) {
  await ensureParentTables();
  await sql`DELETE FROM assignments WHERE id = ${id}`;
}

export async function upsertHomework(studentId: string, assignmentId: string, status: "assigned" | "done" | "missed") {
  await ensureParentTables();
  await sql`
    INSERT INTO homework_submissions (id, student_id, assignment_id, status, completed_at)
    VALUES (${crypto.randomUUID()}, ${studentId}, ${assignmentId}, ${status}, ${status === "done" ? new Date().toISOString() : null})
    ON CONFLICT (student_id, assignment_id)
    DO UPDATE SET status = ${status}, completed_at = ${status === "done" ? new Date().toISOString() : null}
  `;
}

export async function getHomeworkForStudent(studentId: string, weekNo?: number) {
  await ensureParentTables();
  const rows = weekNo !== undefined
    ? await sql`
        SELECT a.id, a.week_no, a.title, a.due_at,
               COALESCE(hs.status, 'assigned') AS status
        FROM assignments a
        LEFT JOIN homework_submissions hs ON hs.assignment_id = a.id AND hs.student_id = ${studentId}
        WHERE a.week_no = ${weekNo}
        ORDER BY a.created_at
      `
    : await sql`
        SELECT a.id, a.week_no, a.title, a.due_at,
               COALESCE(hs.status, 'assigned') AS status
        FROM assignments a
        LEFT JOIN homework_submissions hs ON hs.assignment_id = a.id AND hs.student_id = ${studentId}
        ORDER BY a.week_no DESC, a.created_at
      `;
  return rows;
}

export async function getAllStudentsHomework(weekNo: number) {
  await ensureParentTables();
  const rows = await sql`
    SELECT
      u.id AS student_id, u.name AS student_name,
      a.id AS assignment_id, a.title, a.week_no,
      COALESCE(hs.status, 'assigned') AS status
    FROM users u
    CROSS JOIN assignments a
    LEFT JOIN homework_submissions hs ON hs.assignment_id = a.id AND hs.student_id = u.id
    WHERE u.role = 'student' AND a.week_no = ${weekNo}
    ORDER BY u.name, a.created_at
  `;
  return rows;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export async function upsertAttendance(studentId: string, sessionId: string, status: "present" | "late" | "absent") {
  await ensureParentTables();
  await sql`
    INSERT INTO session_attendance (id, student_id, session_id, status)
    VALUES (${crypto.randomUUID()}, ${studentId}, ${sessionId}, ${status})
    ON CONFLICT (student_id, session_id)
    DO UPDATE SET status = ${status}, marked_at = NOW()
  `;
}

export async function getAttendanceForSession(sessionId: string) {
  await ensureParentTables();
  const rows = await sql`
    SELECT u.id AS student_id, u.name AS student_name,
           COALESCE(sa.status, 'absent') AS status
    FROM users u
    LEFT JOIN session_attendance sa ON sa.student_id = u.id AND sa.session_id = ${sessionId}
    WHERE u.role = 'student'
    ORDER BY u.name
  `;
  return rows;
}

export async function getAttendanceForStudent(studentId: string) {
  await ensureParentTables();
  const rows = await sql`
    SELECT sa.status, sa.marked_at, ls.title, ls.scheduled_at, ls.id AS session_id
    FROM session_attendance sa
    JOIN live_sessions ls ON ls.id = sa.session_id
    WHERE sa.student_id = ${studentId}
    ORDER BY ls.scheduled_at DESC
  `;
  return rows;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface ReportMetrics {
  student:    string;
  week:       number;
  attendance: { status: string; sessionTitle?: string };
  homework:   { done: number; assigned: number };
  practice:   { aiSessions: number };
  score:      { latestMock: number | null; target: number | null; deltaSinceLast: number | null };
  strengths:  string[];
  focusAreas: string[];
}

export async function buildReportMetrics(studentId: string, weekNo: number, periodStart: string, periodEnd: string): Promise<ReportMetrics> {
  await ensureParentTables();

  const [studentRows, attendanceRows, hwRows, scoreRows] = await Promise.all([
    sql`SELECT name FROM users WHERE id = ${studentId}`,
    sql`
      SELECT sa.status, ls.title
      FROM session_attendance sa
      JOIN live_sessions ls ON ls.id = sa.session_id
      WHERE sa.student_id = ${studentId}
        AND ls.scheduled_at >= ${periodStart}
        AND ls.scheduled_at <= ${periodEnd}
      ORDER BY ls.scheduled_at DESC LIMIT 1
    `,
    sql`
      SELECT COALESCE(hs.status, 'assigned') AS status
      FROM assignments a
      LEFT JOIN homework_submissions hs ON hs.assignment_id = a.id AND hs.student_id = ${studentId}
      WHERE a.week_no = ${weekNo}
    `,
    sql`
      SELECT total_score, taken_at FROM assessments
      WHERE student_id = ${studentId}
      ORDER BY taken_at DESC LIMIT 2
    `,
  ]);

  const hwDone     = (hwRows as { status: string }[]).filter(r => r.status === "done").length;
  const hwTotal    = hwRows.length;
  const latestMock = (scoreRows[0] as { total_score: number } | undefined)?.total_score ?? null;
  const prevMock   = (scoreRows[1] as { total_score: number } | undefined)?.total_score ?? null;

  // Pull real analytics
  const [aiUsage, skillsData] = await Promise.all([
    getAITutorUsage(studentId, periodStart),
    getStrengthsAndFocus(studentId),
  ]);

  return {
    student:    (studentRows[0] as { name: string }).name ?? "Student",
    week:       weekNo,
    attendance: attendanceRows[0]
      ? { status: (attendanceRows[0] as { status: string }).status, sessionTitle: (attendanceRows[0] as { title: string }).title }
      : { status: "not recorded" },
    homework:   { done: hwDone, assigned: hwTotal },
    practice:   { aiSessions: Number(aiUsage.session_count ?? 0) },
    score: {
      latestMock,
      target: null,
      deltaSinceLast: latestMock !== null && prevMock !== null ? latestMock - prevMock : null,
    },
    strengths:  skillsData.strengths,
    focusAreas: skillsData.focusAreas,
  };
}

// ─── O-Level report metrics (parallel to ReportMetrics above, different shape —
// O-Level has no single mock score; progress is per-subject quiz performance) ──

export interface OLevelSubjectReportRow {
  subject: string;
  subjectLabel: string;
  attempts: number;
  avgPercent: number | null;
}

export interface OLevelReportMetrics {
  student:    string;
  week:       number;
  program:    "o-level";
  attendance: { status: string; sessionTitle?: string };
  subjects:   OLevelSubjectReportRow[];
  strengths:  string[];
  focusAreas: string[];
}

export async function buildOLevelReportMetrics(
  studentId: string, studentEmail: string, weekNo: number, periodStart: string, periodEnd: string
): Promise<OLevelReportMetrics> {
  await ensureParentTables();

  const [studentRows, attendanceRows, accessMap, subjectPerf] = await Promise.all([
    sql`SELECT name FROM users WHERE id = ${studentId}`,
    sql`
      SELECT sa.status, ls.title
      FROM session_attendance sa
      JOIN live_sessions ls ON ls.id = sa.session_id
      WHERE sa.student_id = ${studentId}
        AND ls.scheduled_at >= ${periodStart}
        AND ls.scheduled_at <= ${periodEnd}
      ORDER BY ls.scheduled_at DESC LIMIT 1
    `,
    getOLevelAccessMap(studentEmail),
    getSubjectPerformanceForStudent(studentEmail),
  ]);

  const perfBySubject = new Map(subjectPerf.map((s) => [s.subject, s]));
  const unlockedSubjects = Object.entries(accessMap).filter(([, status]) => status === "unlocked").map(([s]) => s);
  const subjectLabel = (slug: string) => getSubject(slug)?.name ?? slug;

  const subjects: OLevelSubjectReportRow[] = unlockedSubjects.map((subject) => {
    const perf = perfBySubject.get(subject);
    return {
      subject,
      subjectLabel: subjectLabel(subject),
      attempts: perf?.attempts ?? 0,
      avgPercent: perf?.avgPercent ?? null,
    };
  });

  const strengths = subjectPerf
    .filter((s) => s.avgPercent !== null && s.avgPercent >= 70)
    .map((s) => subjectLabel(s.subject));
  const focusAreas = subjectPerf.flatMap((s) => s.weakTopics).slice(0, 3);

  return {
    student: (studentRows[0] as { name: string } | undefined)?.name ?? "Student",
    week: weekNo,
    program: "o-level",
    attendance: attendanceRows[0]
      ? { status: (attendanceRows[0] as { status: string }).status, sessionTitle: (attendanceRows[0] as { title: string }).title }
      : { status: "not recorded" },
    subjects,
    strengths,
    focusAreas,
  };
}

export async function saveReport(
  studentId: string, weekNo: number, periodStart: string, periodEnd: string,
  metrics: ReportMetrics | OLevelReportMetrics, coachNote: string, parentAction: string
) {
  await ensureParentTables();
  const id = crypto.randomUUID();
  // Regenerating a week replaces the previous unsent draft instead of stacking duplicates.
  await sql`
    DELETE FROM parent_reports
    WHERE student_id = ${studentId} AND week_no = ${weekNo} AND status = 'draft'
  `;
  await sql`
    INSERT INTO parent_reports (id, student_id, week_no, period_start, period_end, metrics_json, coach_note, parent_action, status)
    VALUES (${id}, ${studentId}, ${weekNo}, ${periodStart}, ${periodEnd}, ${JSON.stringify(metrics)}, ${coachNote}, ${parentAction}, 'draft')
  `;
  return id;
}

export async function updateReportStatus(id: string, status: "draft" | "approved" | "sent") {
  await ensureParentTables();
  await sql`
    UPDATE parent_reports
    SET status = ${status}, sent_at = ${status === "sent" ? new Date().toISOString() : null}
    WHERE id = ${id}
  `;
}

// Parent-facing: drafts stay invisible until the coach approves them.
export async function getReportForStudent(studentId: string, weekNo?: number) {
  await ensureParentTables();
  const rows = weekNo !== undefined
    ? await sql`SELECT * FROM parent_reports WHERE student_id = ${studentId} AND week_no = ${weekNo} AND status IN ('approved','sent') ORDER BY created_at DESC LIMIT 1`
    : await sql`SELECT * FROM parent_reports WHERE student_id = ${studentId} AND status IN ('approved','sent') ORDER BY week_no DESC LIMIT 1`;
  return rows[0] ?? null;
}

export async function listReportsForStudent(studentId: string) {
  await ensureParentTables();
  return sql`
    SELECT * FROM parent_reports
    WHERE student_id = ${studentId} AND status IN ('approved','sent')
    ORDER BY week_no DESC
  `;
}

export async function listAllReports() {
  await ensureParentTables();
  const rows = await sql`
    SELECT pr.*, u.name AS student_name, u.email AS student_email, u.program AS student_program
    FROM parent_reports pr
    JOIN users u ON u.id = pr.student_id
    ORDER BY pr.week_no DESC, pr.created_at DESC
  `;
  return rows;
}

export async function getReportById(id: string) {
  await ensureParentTables();
  const rows = await sql`SELECT * FROM parent_reports WHERE id = ${id}`;
  return rows[0] ?? null;
}

export async function updateReportFields(id: string, coachNote: string, parentAction: string, narrative?: string) {
  await ensureParentTables();
  await sql`
    UPDATE parent_reports
    SET coach_note = ${coachNote}, parent_action = ${parentAction}, narrative = ${narrative ?? null}
    WHERE id = ${id}
  `;
}
