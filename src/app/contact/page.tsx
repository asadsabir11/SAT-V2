import { ContactForm } from "@/components/forms";
import { PageHero } from "@/components/site";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@thedigitaltutor.net";
const SAT_WHATSAPP_URL    = process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL || "";
const OLEVEL_WHATSAPP_URL = process.env.NEXT_PUBLIC_OLEVEL_WHATSAPP_COMMUNITY_URL || "";

export default function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Questions are welcome. Ambition is, too.">
        Reach out about student enrollment, parent support, regional class times, or sponsorship.
      </PageHero>

      <section className="section">
        <div className="container grid grid-2" style={{ alignItems: "start" }}>
          <ContactForm />

          <div className="card">
            <h3>Other ways to connect</h3>

            <p>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#155eef" }}>{CONTACT_EMAIL}</a>
            </p>

            <div style={{ marginTop: 20 }}>
              <strong>Community groups</strong>
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {([
                  { label: "SAT Prep community", url: SAT_WHATSAPP_URL },
                  { label: "O Level community", url: OLEVEL_WHATSAPP_URL },
                ] as const).map(({ label, url }) => (
                  url ? (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "12px 16px", borderRadius: 10,
                        background: "#d1fae5", color: "#065f46",
                        fontWeight: 700, fontSize: ".88rem", textDecoration: "none",
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>💬</span>
                      Join {label} →
                    </a>
                  ) : (
                    <div key={label} style={{ padding: "12px 16px", borderRadius: 10, background: "#f8fafc", color: "#a0aec0", fontSize: ".88rem" }}>
                      💬 {label} — link coming soon
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
