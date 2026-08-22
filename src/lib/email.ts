import { Resend } from "resend";
import type { OLevelApplication } from "@/lib/olevelApplications";

const ADMIN_EMAIL  = process.env.ADMIN_EMAIL ?? "";
const ADMIN_EMAILS = ADMIN_EMAIL.split(",").map(e => e.trim()).filter(Boolean);
const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL ?? "";
const OLEVEL_WHATSAPP_URL = process.env.NEXT_PUBLIC_OLEVEL_WHATSAPP_COMMUNITY_URL ?? "";
const APP_URL      = "https://academy.thedigitaltutor.net";

const SUBJECT_LABELS: Record<string, string> = {
  "english-language": "English Language",
  "mathematics": "Mathematics",
  "english-language+mathematics": "English Language and Mathematics",
  "computer-science-waitlist": "Computer Science (waiting list)",
  "islamiyat-waitlist": "Islamiyat (waiting list)",
  "pakistan-studies-waitlist": "Pakistan Studies (waiting list)",
};
const subjectLabel = (s: string) => SUBJECT_LABELS[s] ?? s;

type SendEmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
};

// The Resend SDK does NOT throw on API-level failures (invalid sender,
// quota/rate limits, restricted key, etc.) — it returns { data, error }.
// Every call site in this file used to ignore that field entirely, so a
// failed send looked identical to a successful one: no exception, no log,
// nothing — the caller (and the person waiting on the email) had no way to
// know it never went out. Centralizing the send here means every email in
// this file now actually surfaces a Resend-side failure via console.error
// instead of failing silently.
async function sendEmail(payload: SendEmailPayload): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not configured" };
  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from: "The Digital Tutor <noreply@academy.thedigitaltutor.net>",
      ...payload,
    });
    if (error) {
      console.error(`Resend rejected email (to: ${payload.to}, subject: "${payload.subject}"):`, error);
      return { ok: false, error: error.message ?? String(error) };
    }
    return { ok: true };
  } catch (e) {
    console.error(`Resend send threw (to: ${payload.to}, subject: "${payload.subject}"):`, e);
    return { ok: false, error: String(e) };
  }
}

export async function sendParentReport(opts: {
  parentEmail: string;
  parentName: string;
  studentName: string;
  weekNo: number;
  attendanceStatus: string;
  homeworkDone: number;
  homeworkTotal: number;
  latestScore: number | null;
  targetScore: number | null;
  scoreDelta: number | null;
  strengths: string[];
  focusAreas: string[];
  coachNote: string;
  parentAction: string;
}) {
  const scoreRow = opts.latestScore
    ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:160px;">Latest score</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${opts.latestScore}${opts.scoreDelta !== null ? ` <span style="color:${opts.scoreDelta >= 0 ? "#15803d" : "#dc2626"}">(${opts.scoreDelta >= 0 ? "+" : ""}${opts.scoreDelta})</span>` : ""}</td></tr>`
    : "";
  const targetRow = opts.targetScore
    ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Target score</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#155eef;">${opts.targetScore}</td></tr>`
    : "";

  return sendEmail({
    to: opts.parentEmail,
    subject: `Week ${opts.weekNo} Progress Report — ${opts.studentName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#071b33,#0f2d54);padding:24px;border-radius:12px;margin-bottom:24px;">
          <p style="color:#5eead4;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin:0 0 6px;">Weekly Progress Report</p>
          <h1 style="color:#fff;margin:0 0 4px;font-size:1.4rem;">${opts.studentName}</h1>
          <p style="color:rgba(255,255,255,.6);margin:0;font-size:.85rem;">Week ${opts.weekNo}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e8eef6;margin-bottom:20px;">
          <tr><td style="padding:10px 0 10px 16px;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:160px;">Attendance</td><td style="padding:10px 16px 10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${opts.attendanceStatus === "present" ? "✅ Present" : opts.attendanceStatus === "late" ? "🕐 Late" : opts.attendanceStatus === "not recorded" ? "— Not recorded" : "❌ Absent"}</td></tr>
          <tr><td style="padding:10px 0 10px 16px;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Homework</td><td style="padding:10px 16px 10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${opts.homeworkDone}/${opts.homeworkTotal} assignments completed</td></tr>
          ${scoreRow}${targetRow}
        </table>

        ${opts.strengths.length ? `<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:16px 18px;margin-bottom:14px;"><p style="color:#15803d;font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px;">Strengths</p><p style="margin:0;color:#065f46;font-weight:600;">${opts.strengths.join(" · ")}</p></div>` : ""}
        ${opts.focusAreas.length ? `<div style="background:#fff7ed;border:1.5px solid #fdba74;border-radius:10px;padding:16px 18px;margin-bottom:14px;"><p style="color:#c2410c;font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px;">Focus areas</p><p style="margin:0;color:#9a3412;font-weight:600;">${opts.focusAreas.join(" · ")}</p></div>` : ""}

        <div style="background:#eff6ff;border-radius:10px;padding:16px 18px;margin-bottom:14px;">
          <p style="color:#1d4ed8;font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px;">Coach note</p>
          <p style="margin:0;color:#1e3a5f;font-style:italic;line-height:1.6;">"${opts.coachNote}"</p>
          <p style="margin:8px 0 0;color:#6b7c93;font-size:.78rem;">— Ibrahim Malick, Founder &amp; Coach</p>
        </div>

        <div style="background:linear-gradient(135deg,#155eef,#18a999);border-radius:10px;padding:16px 18px;margin-bottom:24px;">
          <p style="color:rgba(255,255,255,.7);font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px;">⭐ Your action this week</p>
          <p style="color:#fff;font-weight:800;margin:0;font-size:.95rem;line-height:1.5;">${opts.parentAction}</p>
        </div>

        <div style="text-align:center;margin-bottom:20px;">
          <a href="${APP_URL}/parent" style="display:inline-block;padding:12px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.9rem;">View full report →</a>
        </div>

        <p style="color:#a0aec0;font-size:.72rem;line-height:1.6;">SAT® is a registered trademark of College Board. The Digital Tutor is an independent preparation service. No score guarantees implied.<br>The Digital Tutor · academy.thedigitaltutor.net</p>
      </div>
    `,
  });
}

export async function sendOLevelParentReport(opts: {
  parentEmail: string;
  parentName: string;
  studentName: string;
  weekNo: number;
  attendanceStatus: string;
  subjects: { subjectLabel: string; attempts: number; avgPercent: number | null }[];
  strengths: string[];
  focusAreas: string[];
  coachNote: string;
  parentAction: string;
}) {
  const subjectRows = opts.subjects.map((s) => `
    <tr><td style="padding:10px 0 10px 16px;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:200px;">${s.subjectLabel}</td><td style="padding:10px 16px 10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${s.attempts > 0 ? `${s.avgPercent}% average · ${s.attempts} quiz${s.attempts !== 1 ? "zes" : ""} attempted` : "No quiz attempts yet"}</td></tr>
  `).join("");

  return sendEmail({
    to: opts.parentEmail,
    subject: `Week ${opts.weekNo} Progress Report — ${opts.studentName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#071b33,#0f2d54);padding:24px;border-radius:12px;margin-bottom:24px;">
          <p style="color:#5eead4;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin:0 0 6px;">Weekly Progress Report</p>
          <h1 style="color:#fff;margin:0 0 4px;font-size:1.4rem;">${opts.studentName}</h1>
          <p style="color:rgba(255,255,255,.6);margin:0;font-size:.85rem;">Week ${opts.weekNo}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e8eef6;margin-bottom:20px;">
          <tr><td style="padding:10px 0 10px 16px;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:200px;">Attendance</td><td style="padding:10px 16px 10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${opts.attendanceStatus === "present" ? "✅ Present" : opts.attendanceStatus === "late" ? "🕐 Late" : opts.attendanceStatus === "not recorded" ? "— Not recorded" : "❌ Absent"}</td></tr>
          ${subjectRows}
        </table>

        ${opts.strengths.length ? `<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:16px 18px;margin-bottom:14px;"><p style="color:#15803d;font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px;">Strengths</p><p style="margin:0;color:#065f46;font-weight:600;">${opts.strengths.join(" · ")}</p></div>` : ""}
        ${opts.focusAreas.length ? `<div style="background:#fff7ed;border:1.5px solid #fdba74;border-radius:10px;padding:16px 18px;margin-bottom:14px;"><p style="color:#c2410c;font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px;">Focus areas</p><p style="margin:0;color:#9a3412;font-weight:600;">${opts.focusAreas.join(" · ")}</p></div>` : ""}

        <div style="background:#eff6ff;border-radius:10px;padding:16px 18px;margin-bottom:14px;">
          <p style="color:#1d4ed8;font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px;">Coach note</p>
          <p style="margin:0;color:#1e3a5f;font-style:italic;line-height:1.6;">"${opts.coachNote}"</p>
          <p style="margin:8px 0 0;color:#6b7c93;font-size:.78rem;">— Ibrahim Malick, Founder &amp; Coach</p>
        </div>

        <div style="background:linear-gradient(135deg,#155eef,#18a999);border-radius:10px;padding:16px 18px;margin-bottom:24px;">
          <p style="color:rgba(255,255,255,.7);font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px;">⭐ Your action this week</p>
          <p style="color:#fff;font-weight:800;margin:0;font-size:.95rem;line-height:1.5;">${opts.parentAction}</p>
        </div>

        <div style="text-align:center;margin-bottom:20px;">
          <a href="${APP_URL}/parent" style="display:inline-block;padding:12px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.9rem;">View full report →</a>
        </div>

        <p style="color:#a0aec0;font-size:.72rem;line-height:1.6;">Cambridge, IGCSE and O Level are registered trademarks of Cambridge Assessment International Education. The Digital Tutor is an independent tuition service and is not affiliated with Cambridge Assessment.<br>The Digital Tutor · academy.thedigitaltutor.net</p>
      </div>
    `,
  });
}

export async function sendNewStudentAlert(student: {
  name: string;
  email: string;
  country?: string;
  packageType?: string;
  grade?: string;
}) {
  if (ADMIN_EMAILS.length === 0) return;
  await sendEmail({
    to: ADMIN_EMAILS,
    subject: `New student registered: ${student.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 8px;">New student registered 🎉</h2>
        <p style="color:#6b7c93;margin:0 0 24px;font-size:.9rem;">A new student just signed up on The Digital Tutor.</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:120px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${student.name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#155eef;">${student.email}</td></tr>
          ${student.country ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Country</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${student.country}</td></tr>` : ""}
          ${student.packageType ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Package</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${student.packageType}</td></tr>` : ""}
          ${student.grade ? `<tr><td style="padding:10px 0;color:#6b7c93;font-size:.85rem;">Grade</td><td style="padding:10px 0;color:#071b33;">${student.grade}</td></tr>` : ""}
        </table>
        <div style="margin-top:24px;">
          <a href="${APP_URL}/admin" style="display:inline-block;padding:12px 24px;background:#155eef;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">View in admin →</a>
        </div>
        <p style="color:#a0aec0;font-size:.75rem;margin-top:24px;">The Digital Tutor · academy.thedigitaltutor.net</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(student: { name: string; email: string }) {
  const waSection = WHATSAPP_URL
    ? `<div style="margin:20px 0;padding:16px 20px;background:#dcfce7;border-radius:10px;">
        <p style="margin:0 0 8px;font-weight:700;color:#166534;">Join our WhatsApp community</p>
        <p style="margin:0 0 12px;color:#166534;font-size:.88rem;">Get updates, ask questions, and connect with other students.</p>
        <a href="${WHATSAPP_URL}" style="display:inline-block;padding:10px 20px;background:#25d366;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:.88rem;">Join WhatsApp →</a>
      </div>`
    : "";

  await sendEmail({
    to: student.email,
    subject: "Welcome to The Digital Tutor — you're in!",
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 6px;font-size:1.4rem;">Welcome, ${student.name}! 🎉</h2>
        <p style="color:#6b7c93;margin:0 0 24px;font-size:.95rem;line-height:1.6;">
          You've joined <strong style="color:#071b33;">The Digital Tutor</strong> SAT Prep program. Here's how to get started:
        </p>

        <div style="background:#fff;border-radius:10px;padding:20px 24px;margin-bottom:16px;border:1.5px solid #e8eef6;">
          <p style="margin:0 0 14px;font-weight:800;color:#071b33;font-size:.95rem;">Your first steps</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0f4f8;vertical-align:top;">
                <span style="display:inline-block;width:22px;height:22px;background:#155eef;color:#fff;border-radius:50%;text-align:center;line-height:22px;font-size:.7rem;font-weight:900;margin-right:10px;">1</span>
                <strong style="color:#071b33;">Take your diagnostic</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:2px 0 10px 32px;border-bottom:1px solid #f0f4f8;color:#6b7c93;font-size:.85rem;">Identifies your weak areas so we can focus your study time</td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0f4f8;vertical-align:top;">
                <span style="display:inline-block;width:22px;height:22px;background:#155eef;color:#fff;border-radius:50%;text-align:center;line-height:22px;font-size:.7rem;font-weight:900;margin-right:10px;">2</span>
                <strong style="color:#071b33;">Explore the AI Tutor</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:2px 0 10px 32px;border-bottom:1px solid #f0f4f8;color:#6b7c93;font-size:.85rem;">Ask any SAT question and get an instant, step-by-step explanation</td>
            </tr>
            <tr>
              <td style="padding:8px 0;vertical-align:top;">
                <span style="display:inline-block;width:22px;height:22px;background:#155eef;color:#fff;border-radius:50%;text-align:center;line-height:22px;font-size:.7rem;font-weight:900;margin-right:10px;">3</span>
                <strong style="color:#071b33;">Join a live session</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:2px 0 0 32px;color:#6b7c93;font-size:.85rem;">Check your Sessions page for upcoming instructor-led classes</td>
            </tr>
          </table>
        </div>

        ${waSection}

        <div style="margin-top:20px;">
          <a href="${APP_URL}/dashboard" style="display:inline-block;padding:13px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.95rem;">Go to my dashboard →</a>
        </div>

        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;line-height:1.6;">
          Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#155eef;">our contact page</a>.<br>
          The Digital Tutor · academy.thedigitaltutor.net
        </p>
      </div>
    `,
  });
}

export async function sendSatUnlockPaymentSubmittedAck(opts: { email: string; name: string }) {
  await sendEmail({
    to: opts.email,
    subject: "Payment received — under review",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">We've got your payment details, ${opts.name}</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 20px;">
          Your payment for full SAT access is under review. Once verified, your account unlocks automatically and
          we'll email you — usually within a business day.
        </p>
        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;">The Digital Tutor · academy.thedigitaltutor.net</p>
      </div>
    `,
  });
}

export async function sendSatUnlockPaymentSubmittedAdminAlert(opts: { email: string; name: string }) {
  if (ADMIN_EMAILS.length === 0) return;
  await sendEmail({
    to: ADMIN_EMAILS,
    subject: `SAT payment submitted for verification: ${opts.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 8px;">Payment awaiting verification 💳</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:100px;">Student</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${opts.name}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7c93;font-size:.85rem;">Email</td><td style="padding:10px 0;color:#155eef;">${opts.email}</td></tr>
        </table>
        <div style="margin-top:20px;">
          <a href="${APP_URL}/admin/access" style="display:inline-block;padding:12px 24px;background:#155eef;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">Review and verify →</a>
        </div>
      </div>
    `,
  });
}

export async function sendSatAccessGranted(opts: { email: string; name: string }) {
  await sendEmail({
    to: opts.email,
    subject: "Your SAT access is unlocked! 🎉",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">You're in, ${opts.name}! 🎉</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 20px;">
          Your payment has been verified and your account now has full access. All lectures, practice tests, live
          sessions, the Q&amp;A board, and the AI tutor are ready to go.
        </p>
        <div style="margin-bottom:20px;">
          <a href="${APP_URL}/dashboard" style="display:inline-block;padding:13px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.95rem;">Go to my dashboard →</a>
        </div>
        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;">The Digital Tutor · academy.thedigitaltutor.net</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(opts: { email: string; name: string; resetUrl: string }) {
  await sendEmail({
    to: opts.email,
    subject: "Reset your password — The Digital Tutor",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 8px;">Reset your password</h2>
        <p style="color:#6b7c93;margin:0 0 24px;font-size:.9rem;line-height:1.6;">
          Hi ${opts.name}, we received a request to reset the password on your Digital Tutor account. This link can only be used once.
        </p>
        <div style="margin-bottom:20px;">
          <a href="${opts.resetUrl}" style="display:inline-block;padding:13px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.95rem;">Reset my password →</a>
        </div>
        <p style="color:#a0aec0;font-size:.78rem;line-height:1.6;">
          If you didn't request this, you can safely ignore this email — your password will not change.<br>
          The Digital Tutor · academy.thedigitaltutor.net
        </p>
      </div>
    `,
  });
}

export async function sendOLevelAccountWelcome(opts: { email: string; name: string; setupUrl: string; subject: string }) {
  await sendEmail({
    to: opts.email,
    subject: "Your enrollment is confirmed — set up your account",
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">You're enrolled, ${opts.name}! 🎉</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 20px;">
          Payment has been verified for <strong>${subjectLabel(opts.subject)}</strong>. Set a password below to access
          your student dashboard, lectures, quizzes and sessions.
        </p>
        <div style="margin-bottom:20px;">
          <a href="${opts.setupUrl}" style="display:inline-block;padding:13px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.95rem;">Set my password →</a>
        </div>
        <p style="color:#a0aec0;font-size:.78rem;line-height:1.6;">
          This link can only be used once. Once set, sign in any time at academy.thedigitaltutor.net/login as a Student
          using this email address.<br>
          The Digital Tutor · academy.thedigitaltutor.net
        </p>
      </div>
    `,
  });
}

export async function sendParentAccountWelcome(opts: { email: string; name: string; studentName: string; studentEmail: string; program: "sat" | "o-level"; setupUrl: string }) {
  const programLabel = opts.program === "o-level" ? "Cambridge O Level" : "SAT Prep";
  await sendEmail({
    to: opts.email,
    subject: `Your parent account is ready — track ${opts.studentName}'s ${programLabel} progress`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">Welcome, ${opts.name} 👋</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 20px;">
          A parent account has been set up for you so you can follow <strong>${opts.studentName}</strong>&apos;s
          (${opts.studentEmail}) attendance, homework, and weekly progress reports in the <strong>${programLabel}</strong>
          program. Set a password below to get started.
        </p>
        <div style="margin-bottom:20px;">
          <a href="${opts.setupUrl}" style="display:inline-block;padding:13px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.95rem;">Set my password →</a>
        </div>
        <p style="color:#a0aec0;font-size:.78rem;line-height:1.6;">
          This link can only be used once. Once set, sign in any time at academy.thedigitaltutor.net/login as a Parent
          (Program: ${programLabel}) using this email address.<br>
          The Digital Tutor · academy.thedigitaltutor.net
        </p>
      </div>
    `,
  });
}

export async function sendScholarshipAccountWelcome(opts: { email: string; name: string; program: "sat" | "o-level"; setupUrl: string }) {
  const programLabel = opts.program === "o-level" ? "Cambridge O Level" : "SAT Prep";
  return sendEmail({
    to: opts.email,
    subject: `Welcome to the ${programLabel} program — you're in!`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">Congratulations, ${opts.name}! 🎉</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 20px;">
          Your Opportunity Scholarship application has been approved, and your account for the
          <strong>${programLabel}</strong> program is ready. Set a password below to get started — you&apos;ll have
          the same classes, resources and support as every other Digital Tutor student.
        </p>
        <div style="margin-bottom:20px;">
          <a href="${opts.setupUrl}" style="display:inline-block;padding:13px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.95rem;">Set my password →</a>
        </div>
        <p style="color:#a0aec0;font-size:.78rem;line-height:1.6;">
          This link can only be used once. Once set, sign in any time at academy.thedigitaltutor.net/login as a
          Student (Program: ${programLabel}) using this email address.<br>
          The Digital Tutor · academy.thedigitaltutor.net
        </p>
      </div>
    `,
  });
}

// Sent instead of sendScholarshipAccountWelcome when the chosen email already
// has a student account in this program (they registered normally before
// applying) — there's no new password to set, so this just confirms the
// scholarship instead of sending a redundant/confusing reset-password link.
export async function sendScholarshipApprovedExistingAccount(opts: { email: string; name: string; program: "sat" | "o-level" }) {
  const programLabel = opts.program === "o-level" ? "Cambridge O Level" : "SAT Prep";
  return sendEmail({
    to: opts.email,
    subject: `Your Opportunity Scholarship is approved, ${opts.name}!`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">Congratulations, ${opts.name}! 🎉</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 20px;">
          Your Opportunity Scholarship application has been approved for the <strong>${programLabel}</strong>
          program. Since you already have an account with this email, there&apos;s nothing new to set up — sign in
          any time with your existing password to keep going.
        </p>
        <div style="margin-bottom:20px;">
          <a href="${APP_URL}/login" style="display:inline-block;padding:13px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.95rem;">Sign in →</a>
        </div>
        <p style="color:#a0aec0;font-size:.78rem;line-height:1.6;">
          Forgot your password? Use the &quot;Forgot password?&quot; link on the sign-in page.<br>
          The Digital Tutor · academy.thedigitaltutor.net
        </p>
      </div>
    `,
  });
}

export async function sendTeacherAccountWelcome(opts: { email: string; name: string; setupUrl: string }) {
  await sendEmail({
    to: opts.email,
    subject: "Your teacher account is ready — set your password",
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">Welcome, ${opts.name} 👋</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 20px;">
          A teacher account has been set up for you on the admin dashboard. Set a password below to get started.
        </p>
        <div style="margin-bottom:20px;">
          <a href="${opts.setupUrl}" style="display:inline-block;padding:13px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.95rem;">Set my password →</a>
        </div>
        <p style="color:#a0aec0;font-size:.78rem;line-height:1.6;">
          This link can only be used once. Once set, sign in any time at academy.thedigitaltutor.net/login as a Teacher
          using this email address.<br>
          The Digital Tutor · academy.thedigitaltutor.net
        </p>
      </div>
    `,
  });
}

export async function sendOLevelRegistrationWelcome(student: { name: string; email: string }) {
  const waSection = OLEVEL_WHATSAPP_URL
    ? `<div style="margin:20px 0;padding:16px 20px;background:#dcfce7;border-radius:10px;">
        <p style="margin:0 0 8px;font-weight:700;color:#166534;">Join our O Level WhatsApp community</p>
        <p style="margin:0 0 12px;color:#166534;font-size:.88rem;">Get updates, ask questions, and connect with other O Level students.</p>
        <a href="${OLEVEL_WHATSAPP_URL}" style="display:inline-block;padding:10px 20px;background:#25d366;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:.88rem;">Join WhatsApp →</a>
      </div>`
    : "";

  await sendEmail({
    to: student.email,
    subject: "Welcome to The Digital Tutor — you're in!",
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 6px;font-size:1.4rem;">Welcome, ${student.name}! 🎉</h2>
        <p style="color:#6b7c93;margin:0 0 24px;font-size:.95rem;line-height:1.6;">
          You've created your free O Level account. Here's how it works:
        </p>
        <div style="background:#fff;border-radius:10px;padding:20px 24px;margin-bottom:16px;border:1.5px solid #e8eef6;">
          <p style="margin:0 0 14px;font-weight:800;color:#071b33;font-size:.95rem;">Your next steps</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0f4f8;vertical-align:top;">
                <span style="display:inline-block;width:22px;height:22px;background:#155eef;color:#fff;border-radius:50%;text-align:center;line-height:22px;font-size:.7rem;font-weight:900;margin-right:10px;">1</span>
                <strong style="color:#071b33;">Browse your subjects</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:2px 0 10px 32px;border-bottom:1px solid #f0f4f8;color:#6b7c93;font-size:.85rem;">Lectures, quizzes and past papers are all visible in your dashboard</td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0f4f8;vertical-align:top;">
                <span style="display:inline-block;width:22px;height:22px;background:#155eef;color:#fff;border-radius:50%;text-align:center;line-height:22px;font-size:.7rem;font-weight:900;margin-right:10px;">2</span>
                <strong style="color:#071b33;">Unlock a subject</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:2px 0 10px 32px;border-bottom:1px solid #f0f4f8;color:#6b7c93;font-size:.85rem;">Pick English Language or Mathematics, pay, and submit your payment details for verification</td>
            </tr>
            <tr>
              <td style="padding:8px 0;vertical-align:top;">
                <span style="display:inline-block;width:22px;height:22px;background:#155eef;color:#fff;border-radius:50%;text-align:center;line-height:22px;font-size:.7rem;font-weight:900;margin-right:10px;">3</span>
                <strong style="color:#071b33;">Start learning</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:2px 0 0 32px;color:#6b7c93;font-size:.85rem;">Once we verify your payment, that subject unlocks — usually within a business day</td>
            </tr>
          </table>
        </div>
        <div style="margin-top:20px;">
          <a href="${APP_URL}/dashboard" style="display:inline-block;padding:13px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.95rem;">Go to my dashboard →</a>
        </div>
        ${waSection}
        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;line-height:1.6;">
          Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#155eef;">our contact page</a>.<br>
          The Digital Tutor · academy.thedigitaltutor.net
        </p>
      </div>
    `,
  });
}

export async function sendOLevelRegistrationAdminAlert(student: { studentName: string; studentEmail: string; parentName: string; parentEmail: string; city: string }) {
  if (ADMIN_EMAILS.length === 0) return;
  await sendEmail({
    to: ADMIN_EMAILS,
    subject: `New O Level registration: ${student.studentName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 8px;">New O Level student registered 🎉</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:140px;">Student</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${student.studentName}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Student email</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#155eef;">${student.studentEmail}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Parent</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${student.parentName} · ${student.parentEmail}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7c93;font-size:.85rem;">City</td><td style="padding:10px 0;color:#071b33;">${student.city}</td></tr>
        </table>
        <div style="margin-top:20px;">
          <a href="${APP_URL}/admin" style="display:inline-block;padding:12px 24px;background:#155eef;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">View in admin →</a>
        </div>
      </div>
    `,
  });
}

export async function sendScholarshipApplicationAdminAlert(app: {
  program: "sat" | "o-level"; studentName: string; age: string; city: string; grade: string;
  parentName: string; parentEmail: string; parentWhatsapp: string; incomeRange: string;
}) {
  if (ADMIN_EMAILS.length === 0) return;
  const programLabel = app.program === "o-level" ? "Cambridge O Level" : "SAT Prep";

  await sendEmail({
    to: ADMIN_EMAILS,
    subject: `New scholarship application: ${app.studentName} (${programLabel})`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 8px;">New Opportunity Scholarship application 🎓</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:140px;">Program</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${programLabel}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Student</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${app.studentName} · Age ${app.age} · Grade ${app.grade}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">City</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${app.city}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Parent</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${app.parentName} · ${app.parentEmail} · ${app.parentWhatsapp}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7c93;font-size:.85rem;">Household income</td><td style="padding:10px 0;color:#071b33;">${app.incomeRange}</td></tr>
        </table>
        <p style="color:#6b7c93;font-size:.82rem;margin:14px 0 0;">Full application details, including the student's and parent's written answers, are in the admin panel.</p>
        <div style="margin-top:20px;">
          <a href="${APP_URL}/admin/scholarships" style="display:inline-block;padding:12px 24px;background:#155eef;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">Review in admin →</a>
        </div>
      </div>
    `,
  });
}

export async function sendOLevelUnlockPaymentSubmittedAck(opts: { email: string; name: string; subject: string }) {
  await sendEmail({
    to: opts.email,
    subject: `Payment received — ${subjectLabel(opts.subject)}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">We've got your payment details, ${opts.name}</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 20px;">
          Your payment for <strong>${subjectLabel(opts.subject)}</strong> is under review. Once verified, this
          subject unlocks automatically and we'll email you — usually within a business day.
        </p>
        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;">The Digital Tutor · academy.thedigitaltutor.net</p>
      </div>
    `,
  });
}

export async function sendOLevelUnlockPaymentSubmittedAdminAlert(opts: { email: string; name: string; subject: string }) {
  if (ADMIN_EMAILS.length === 0) return;
  await sendEmail({
    to: ADMIN_EMAILS,
    subject: `Payment submitted for verification: ${opts.name} — ${subjectLabel(opts.subject)}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 8px;">Payment awaiting verification 💳</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:100px;">Student</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${opts.name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#155eef;">${opts.email}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7c93;font-size:.85rem;">Subject</td><td style="padding:10px 0;color:#071b33;">${subjectLabel(opts.subject)}</td></tr>
        </table>
        <div style="margin-top:20px;">
          <a href="${APP_URL}/admin/o-level-access" style="display:inline-block;padding:12px 24px;background:#155eef;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">Review and verify →</a>
        </div>
      </div>
    `,
  });
}

export async function sendOLevelAccessGranted(opts: { email: string; name: string; subject: string }) {
  await sendEmail({
    to: opts.email,
    subject: `${subjectLabel(opts.subject)} is unlocked! 🎉`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">You're in, ${opts.name}! 🎉</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 20px;">
          Your payment has been verified and <strong>${subjectLabel(opts.subject)}</strong> is now unlocked. Lectures,
          quizzes, live sessions and past papers for this subject are ready in your dashboard.
        </p>
        <div style="margin-bottom:20px;">
          <a href="${APP_URL}/dashboard" style="display:inline-block;padding:13px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.95rem;">Go to my dashboard →</a>
        </div>
        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;">The Digital Tutor · academy.thedigitaltutor.net</p>
      </div>
    `,
  });
}

export async function sendOLevelApplicationConfirmation(app: OLevelApplication) {
  await sendEmail({
    to: app.parent_email,
    subject: "We Received Your O Level Founding Cohort Application",
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">Application received</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 20px;">
          Thank you for applying to The Digital Tutor's O Level Founding Cohort. We have received the application
          for <strong>${app.student_name}</strong> and <strong>${subjectLabel(app.subject)}</strong>.
        </p>
        <p style="color:#344054;line-height:1.65;margin:0 0 24px;">
          The next step is to complete the payment instructions, or wait for our team to contact you through WhatsApp.
        </p>
        <div style="text-align:center;">
          <a href="${APP_URL}/o-level/payment?applicationId=${app.id}" style="display:inline-block;padding:13px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.95rem;">View payment instructions →</a>
        </div>
        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;">The Digital Tutor · academy.thedigitaltutor.net</p>
      </div>
    `,
  });
}

export async function sendOLevelApplicationAdminAlert(app: OLevelApplication) {
  if (ADMIN_EMAILS.length === 0) return;
  await sendEmail({
    to: ADMIN_EMAILS,
    subject: `New O Level application: ${app.student_name} (${subjectLabel(app.subject)})`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 16px;">New O Level application 🎉</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:140px;">Parent</td><td style="padding:8px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${app.parent_name}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">WhatsApp</td><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${app.parent_whatsapp}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Student</td><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${app.student_name} (Grade ${app.student_grade})</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">City</td><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${app.city}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Subject</td><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${subjectLabel(app.subject)}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Preferred time</td><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${app.preferred_class_time}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7c93;font-size:.85rem;">Source</td><td style="padding:8px 0;color:#071b33;">${app.source || app.utm_source || "—"}</td></tr>
        </table>
        <div style="margin-top:24px;">
          <a href="${APP_URL}/admin/o-level-applications" style="display:inline-block;padding:12px 24px;background:#155eef;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">View in admin →</a>
        </div>
      </div>
    `,
  });
}

export async function sendOLevelPaymentSubmittedAck(app: OLevelApplication) {
  await sendEmail({
    to: app.parent_email,
    subject: "Payment Information Received — Verification in Progress",
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">Thank you</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 20px;">
          We have received your payment information for <strong>${app.student_name}</strong>
          (${subjectLabel(app.subject)}). Your enrollment will be confirmed after the transaction is verified —
          please allow up to one business day. We'll follow up on WhatsApp and email.
        </p>
        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;">The Digital Tutor · academy.thedigitaltutor.net</p>
      </div>
    `,
  });
}

export async function sendOLevelPaymentSubmittedAdminAlert(app: OLevelApplication) {
  if (ADMIN_EMAILS.length === 0) return;
  await sendEmail({
    to: ADMIN_EMAILS,
    subject: `Payment submitted: ${app.student_name} — needs verification`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 16px;">Payment submitted for verification 💳</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:140px;">Student</td><td style="padding:8px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${app.student_name}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Subject</td><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${subjectLabel(app.subject)}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Method</td><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${app.payment_method ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7c93;font-size:.85rem;">Amount paid</td><td style="padding:8px 0;color:#071b33;">PKR ${app.amount_paid ?? "—"}</td></tr>
        </table>
        <div style="margin-top:24px;">
          <a href="${APP_URL}/admin/o-level-applications" style="display:inline-block;padding:12px 24px;background:#155eef;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">Review and verify →</a>
        </div>
      </div>
    `,
  });
}

export async function sendOLevelEnrollmentConfirmed(app: OLevelApplication, opts?: { startDate?: string; schedule?: string; orientationDate?: string; nextSteps?: string }) {
  await sendEmail({
    to: app.parent_email,
    subject: "Payment Verified — Welcome to The Digital Tutor",
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">Welcome, ${app.student_name}! 🎉</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 20px;">
          Your payment has been verified and <strong>${app.student_name}</strong> is enrolled in
          <strong>${subjectLabel(app.subject)}</strong>.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          ${opts?.startDate ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:140px;">Start date</td><td style="padding:8px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${opts.startDate}</td></tr>` : ""}
          ${opts?.schedule ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Class schedule</td><td style="padding:8px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${opts.schedule}</td></tr>` : ""}
          ${opts?.orientationDate ? `<tr><td style="padding:8px 0;color:#6b7c93;font-size:.85rem;">Orientation</td><td style="padding:8px 0;color:#071b33;">${opts.orientationDate}</td></tr>` : ""}
        </table>
        ${opts?.nextSteps ? `<p style="color:#344054;line-height:1.65;">${opts.nextSteps}</p>` : ""}
        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;">The Digital Tutor · academy.thedigitaltutor.net</p>
      </div>
    `,
  });
}

export async function sendChallanSubmissionAck(opts: { email: string; name: string; amountPaid: number; subjects: string }) {
  await sendEmail({
    to: opts.email,
    subject: "Fee payment received — under review",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">We've got your payment, ${opts.name}</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 16px;">
          Your submission for <strong>${opts.subjects}</strong> — PKR ${opts.amountPaid.toLocaleString()} — is under review.
          Once verified, we'll email you and your access will be renewed — usually within a business day.
        </p>
        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;">The Digital Tutor · academy.thedigitaltutor.net</p>
      </div>
    `,
  });
}

export async function sendChallanSubmissionAdminAlert(opts: { email: string; name: string; amountPaid: number; subjects: string }) {
  if (ADMIN_EMAILS.length === 0) return;
  await sendEmail({
    to: ADMIN_EMAILS,
    subject: `Fee payment submitted for verification: ${opts.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 8px;">Fee payment awaiting verification 💳</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:120px;">Student</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${opts.name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#155eef;">${opts.email}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Covers</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#071b33;">${opts.subjects}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7c93;font-size:.85rem;">Amount</td><td style="padding:10px 0;color:#071b33;">PKR ${opts.amountPaid.toLocaleString()}</td></tr>
        </table>
        <div style="margin-top:20px;">
          <a href="${APP_URL}/admin/fees" style="display:inline-block;padding:12px 24px;background:#155eef;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">Review and verify →</a>
        </div>
      </div>
    `,
  });
}

export async function sendChallanVerified(opts: { email: string; name: string; amountPaid: number; subjects: string }) {
  await sendEmail({
    to: opts.email,
    subject: "Payment verified — you're all set!",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#071b33;margin:0 0 12px;">You're all set, ${opts.name}! 🎉</h2>
        <p style="color:#344054;line-height:1.65;margin:0 0 20px;">
          Your payment of PKR ${opts.amountPaid.toLocaleString()} for <strong>${opts.subjects}</strong> has been verified
          and your access has been renewed.
        </p>
        <div style="margin-bottom:20px;">
          <a href="${APP_URL}/dashboard" style="display:inline-block;padding:13px 28px;background:#155eef;color:#fff;border-radius:9px;text-decoration:none;font-weight:800;font-size:.95rem;">Go to my dashboard →</a>
        </div>
        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;">The Digital Tutor · academy.thedigitaltutor.net</p>
      </div>
    `,
  });
}
