import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export async function sendNewStudentAlert(student: {
  name: string;
  email: string;
  country?: string;
  packageType?: string;
  grade?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !ADMIN_EMAIL) return; // silently skip if not configured

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: "The Digital Tutor <onboarding@resend.dev>",
    to: ADMIN_EMAIL,
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
