import Link from "next/link";

export const metadata = { title: "Privacy Policy — The Digital Tutor" };

export default function PrivacyPolicy() {
  const updated = "July 16, 2026";
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Home</Link>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#071b33", margin: "10px 0 6px", letterSpacing: "-.03em" }}>Privacy Policy</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Last updated: {updated}</p>
        </div>

        <div className="card" style={{ lineHeight: 1.85, color: "#344054" }}>
          <p>
            The Digital Tutor (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is operated by Ibrahim Malick. This policy explains what personal
            information we collect, how we use it, and the choices you have. By registering or using our platform, you
            agree to this policy.
          </p>

          <h2 style={h2}>1. Information we collect</h2>
          <p><strong>Registration data:</strong> When you create an account we collect your name, email address, country, grade level, and the package type you selected.</p>
          <p><strong>Diagnostic and quiz results:</strong> We store your answers and scores so you and your instructor can track progress over time.</p>
          <p><strong>AI tutor conversations:</strong> Messages sent to the AI tutor are processed by OpenAI and are not stored permanently on our servers beyond the active session.</p>
          <p><strong>Usage data:</strong> Standard server logs (IP address, browser type, pages visited, timestamps) collected automatically for security and performance monitoring.</p>

          <h2 style={h2}>2. How we use your information</h2>
          <ul style={ul}>
            <li>To provide and personalise the learning platform — quizzes, lectures, live sessions, and AI tutoring.</li>
            <li>To send you session reminders and progress-related emails.</li>
            <li>To generate parent/guardian progress reports where you have opted in.</li>
            <li>To notify the administrator when a new student registers.</li>
            <li>To improve the platform based on aggregate, anonymised usage patterns.</li>
          </ul>
          <p>We do <strong>not</strong> sell, rent, or share your personal information with third parties for marketing purposes.</p>

          <h2 style={h2}>3. Students under 18</h2>
          <p>
            We recognise that many of our students are minors. We collect only the information necessary to operate
            the service. If a student is under 13, a parent or guardian must provide consent before registration. If
            we become aware that we have collected data from a child under 13 without parental consent, we will
            delete it promptly. Parents may contact us at any time to review, correct, or delete their child&rsquo;s data.
          </p>

          <h2 style={h2}>4. Data sharing</h2>
          <p>We share data only with the services required to operate the platform:</p>
          <ul style={ul}>
            <li><strong>Neon (PostgreSQL hosting)</strong> — stores all account and result data on servers in the United States.</li>
            <li><strong>Vercel</strong> — hosts the application and processes web requests.</li>
            <li><strong>OpenAI</strong> — processes AI tutor messages. Subject to OpenAI&rsquo;s privacy policy.</li>
            <li><strong>Resend</strong> — sends transactional emails (registration confirmation, session reminders).</li>
            <li><strong>Vercel Blob</strong> — stores lecture video files.</li>
          </ul>

          <h2 style={h2}>5. Data retention</h2>
          <p>
            We retain your account data for as long as your account is active. You may request deletion of your account
            and all associated data at any time by contacting us. Deletion requests are processed within 30 days.
          </p>

          <h2 style={h2}>6. Security</h2>
          <p>
            Passwords are hashed with bcrypt and never stored in plain text. Authentication uses short-lived JWT tokens
            stored in httpOnly cookies, which cannot be accessed by browser scripts. All data is transmitted over HTTPS.
          </p>

          <h2 style={h2}>7. Your rights</h2>
          <p>Depending on your country, you may have the right to:</p>
          <ul style={ul}>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data.</li>
            <li>Object to or restrict certain processing.</li>
          </ul>
          <p>To exercise any of these rights, contact us at the address below.</p>

          <h2 style={h2}>8. Cookies</h2>
          <p>
            We use a single httpOnly session cookie (<code>sat_auth</code>) required for authentication. We do not use
            advertising cookies or third-party tracking pixels.
          </p>

          <h2 style={h2}>9. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be notified by email or a prominent
            notice on the platform. Continued use after the notice period constitutes acceptance.
          </p>

          <h2 style={h2}>10. Contact</h2>
          <p>
            Questions or requests about your data:<br />
            <strong>The Digital Tutor — Ibrahim Malick</strong><br />
            Email: <a href="mailto:support@thedigitaltutor.net" style={{ color: "#155eef" }}>support@thedigitaltutor.net</a>
          </p>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
          <Link href="/terms" style={{ color: "#155eef", fontSize: ".88rem", fontWeight: 700 }}>Terms of Service →</Link>
          <Link href="/" style={{ color: "#6b7c93", fontSize: ".88rem" }}>Back to home</Link>
        </div>
      </div>
    </section>
  );
}

const h2: React.CSSProperties = { fontSize: "1.05rem", fontWeight: 800, color: "#071b33", margin: "28px 0 10px" };
const ul: React.CSSProperties = { paddingLeft: 22, margin: "8px 0 12px", display: "grid", gap: 6 };
