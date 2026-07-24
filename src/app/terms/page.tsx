import Link from "next/link";

export const metadata = { title: "Terms of Service — The Digital Tutor" };

export default function TermsOfService() {
  const updated = "July 16, 2026";
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Home</Link>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#071b33", margin: "10px 0 6px", letterSpacing: "-.03em" }}>Terms of Service</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Last updated: {updated}</p>
        </div>

        <div className="card" style={{ lineHeight: 1.85, color: "#344054" }}>
          <p>
            Please read these Terms of Service carefully before using The Digital Tutor platform. By creating an
            account or accessing any part of the service, you agree to be bound by these terms.
          </p>

          <h2 style={h2}>1. About the service</h2>
          <p>
            The Digital Tutor is an independent online SAT® preparation platform operated by Ibrahim Malick. It
            provides live classes, AI-assisted tutoring, diagnostic quizzes, lecture recordings, and live session
            links. The Digital Tutor is not affiliated with, endorsed by, or connected to the College Board or any
            official SAT® administration body. SAT® is a registered trademark of the College Board.
          </p>

          <h2 style={h2}>2. Eligibility</h2>
          <p>
            You may use the platform if you are at least 13 years old. Students under 18 must have a parent or
            guardian review these terms and confirm consent at registration. By registering on behalf of a minor,
            you confirm that you are their parent or legal guardian and accept these terms on their behalf.
          </p>

          <h2 style={h2}>3. Accounts</h2>
          <ul style={ul}>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You must provide accurate information at registration. Providing false information may result in account termination.</li>
            <li>You may not share your account with others or create accounts for people without their consent.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
          </ul>

          <h2 style={h2}>4. No score guarantee</h2>
          <p>
            We do not guarantee any specific SAT® score improvement or outcome. The platform provides structured
            preparation, practice, and support, but results depend on individual effort, study time, and prior
            knowledge. No representation or warranty of score improvement is made or implied.
          </p>

          <h2 style={h2}>5. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul style={ul}>
            <li>Share, reproduce, or distribute platform content (quizzes, lectures, AI tutor outputs) outside the platform without written permission.</li>
            <li>Attempt to access other students&rsquo; accounts or data.</li>
            <li>Use automated tools or bots to interact with the platform.</li>
            <li>Upload or share content that is unlawful, harmful, or violates third-party rights.</li>
            <li>Misrepresent your identity or impersonate another person.</li>
          </ul>

          <h2 style={h2}>6. Payments and refunds</h2>
          <p>
            Paid plans are billed as described at the time of purchase. We offer a 7-day refund for monthly plans
            if you are unsatisfied and have not attended more than one live session. Refund requests must be submitted
            to us by email. We reserve the right to refuse refunds where terms have been abused.
          </p>

          <h2 style={h2}>7. Content ownership</h2>
          <p>
            All course materials, quiz questions, lecture recordings, and AI tutor prompts created by The Digital
            Tutor are our intellectual property. You may use them solely for your personal, non-commercial
            preparation. Diagnostic results and progress data you generate remain yours.
          </p>

          <h2 style={h2}>8. AI tutor disclaimer</h2>
          <p>
            The AI tutor is a supplementary learning tool powered by OpenAI. Its responses are automatically
            generated and may occasionally contain errors. Do not rely solely on AI tutor outputs for exam
            preparation — always verify with your instructor or authoritative sources.
          </p>

          <h2 style={h2}>9. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, The Digital Tutor and Ibrahim Malick shall not be liable for any
            indirect, incidental, or consequential damages arising from your use of the platform, including loss of
            data, exam performance outcomes, or service interruptions.
          </p>

          <h2 style={h2}>10. Changes to the service</h2>
          <p>
            We may modify, suspend, or discontinue any part of the platform at any time. We will provide reasonable
            notice of material changes that affect paid subscribers. Continued use after notice constitutes acceptance
            of the updated terms.
          </p>

          <h2 style={h2}>11. Governing law</h2>
          <p>
            These terms are governed by applicable law. Disputes will be resolved in good faith through direct
            communication before any formal proceeding is initiated.
          </p>

          <h2 style={h2}>12. Contact</h2>
          <p>
            Questions about these terms:<br />
            <strong>The Digital Tutor — Ibrahim Malick</strong><br />
            Email: <a href="mailto:support@thedigitaltutor.net" style={{ color: "#155eef" }}>support@thedigitaltutor.net</a>
          </p>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
          <Link href="/privacy" style={{ color: "#155eef", fontSize: ".88rem", fontWeight: 700 }}>Privacy Policy →</Link>
          <Link href="/" style={{ color: "#6b7c93", fontSize: ".88rem" }}>Back to home</Link>
        </div>
      </div>
    </section>
  );
}

const h2: React.CSSProperties = { fontSize: "1.05rem", fontWeight: 800, color: "#071b33", margin: "28px 0 10px" };
const ul: React.CSSProperties = { paddingLeft: 22, margin: "8px 0 12px", display: "grid", gap: 6 };
