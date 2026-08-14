import { Resend } from "resend";
import type { OLevelApplication } from "@/lib/olevelApplications";

const ADMIN_EMAIL  = process.env.ADMIN_EMAIL ?? "";
const ADMIN_EMAILS = ADMIN_EMAIL.split(",").map(e => e.trim()).filter(Boolean);
const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL ?? "";
const APP_URL      = "https://digital-tutor-sat-prep.vercel.app";

const SUBJECT_LABELS: Record<string, string> = {
  "english-language": "English Language",
  "mathematics": "Mathematics",
  "english-language+mathematics": "English Language and Mathematics",
  "computer-science-waitlist": "Computer Science (waiting list)",
  "islamiyat-waitlist": "Islamiyat (waiting list)",
  "pakistan-studies-waitlist": "Pakistan Studies (waiting list)",
};
const subjectLabel = (s: string) => SUBJECT_LABELS[s] ?? s;

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
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not configured" };

  const resend = new Resend(apiKey);

  const scoreRow = opts.latestScore
    ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;width:160px;">Latest score</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#071b33;">${opts.latestScore}${opts.scoreDelta !== null ? ` <span style="color:${opts.scoreDelta >= 0 ? "#15803d" : "#dc2626"}">(${opts.scoreDelta >= 0 ? "+" : ""}${opts.scoreDelta})</span>` : ""}</td></tr>`
    : "";
  const targetRow = opts.targetScore
    ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e8eef6;color:#6b7c93;font-size:.85rem;">Target score</td><td style="padding:10px 0;border-bottom:1px solid #e8eef6;font-weight:700;color:#155eef;">${opts.targetScore}</td></tr>`
    : "";

  try {
    await resend.emails.send({
      from: "The Digital Tutor <onboarding@resend.dev>",
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

          <p style="color:#a0aec0;font-size:.72rem;line-height:1.6;">SAT® is a registered trademark of College Board. The Digital Tutor is an independent preparation service. No score guarantees implied.<br>The Digital Tutor · digital-tutor-sat-prep.vercel.app</p>
        </div>
      `,
    });
    return { ok: true, error: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function sendNewStudentAlert(student: {
  name: string;
  email: string;
  country?: string;
  packageType?: string;
  grade?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || ADMIN_EMAILS.length === 0) return; // silently skip if not configured

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: "The Digital Tutor <onboarding@resend.dev>",
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
          <a href="https://digital-tutor-sat-prep.vercel.app/admin" style="display:inline-block;padding:12px 24px;background:#155eef;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">View in admin →</a>
        </div>
        <p style="color:#a0aec0;font-size:.75rem;margin-top:24px;">The Digital Tutor · digital-tutor-sat-prep.vercel.app</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(student: { name: string; email: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);

  const waSection = WHATSAPP_URL
    ? `<div style="margin:20px 0;padding:16px 20px;background:#dcfce7;border-radius:10px;">
        <p style="margin:0 0 8px;font-weight:700;color:#166534;">Join our WhatsApp community</p>
        <p style="margin:0 0 12px;color:#166534;font-size:.88rem;">Get updates, ask questions, and connect with other students.</p>
        <a href="${WHATSAPP_URL}" style="display:inline-block;padding:10px 20px;background:#25d366;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:.88rem;">Join WhatsApp →</a>
      </div>`
    : "";

  await resend.emails.send({
    from: "The Digital Tutor <onboarding@resend.dev>",
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
          The Digital Tutor · digital-tutor-sat-prep.vercel.app
        </p>
      </div>
    `,
  });
}

export async function sendOLevelApplicationConfirmation(app: OLevelApplication) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "The Digital Tutor <onboarding@resend.dev>",
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
        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;">The Digital Tutor · digital-tutor-sat-prep.vercel.app</p>
      </div>
    `,
  });
}

export async function sendOLevelApplicationAdminAlert(app: OLevelApplication) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || ADMIN_EMAILS.length === 0) return;
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "The Digital Tutor <onboarding@resend.dev>",
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
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "The Digital Tutor <onboarding@resend.dev>",
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
        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;">The Digital Tutor · digital-tutor-sat-prep.vercel.app</p>
      </div>
    `,
  });
}

export async function sendOLevelPaymentSubmittedAdminAlert(app: OLevelApplication) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || ADMIN_EMAILS.length === 0) return;
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "The Digital Tutor <onboarding@resend.dev>",
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
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "The Digital Tutor <onboarding@resend.dev>",
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
        <p style="color:#a0aec0;font-size:.75rem;margin-top:28px;">The Digital Tutor · digital-tutor-sat-prep.vercel.app</p>
      </div>
    `,
  });
}
