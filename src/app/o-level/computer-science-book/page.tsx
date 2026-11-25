import type { Metadata } from "next";
import Link from "next/link";
import { BookPurchaseLink } from "@/components/BookPurchaseLink";
import { TrackViewContent } from "../TrackViewContent";

const BASE_URL = "https://academy.thedigitaltutor.net";
const BOOK_URL = "https://papercraftpublishers.com/product/o-level-computer-science-interactive-exam-workbook";

export const metadata: Metadata = {
  title: "O Level Computer Science Exam Workbook",
  description: "The O Level Computer Science 2210 exam workbook by Ibrahim Malick, with worked examples, mark schemes and QR-linked video lessons.",
  alternates: { canonical: `${BASE_URL}/o-level/computer-science-book` },
  openGraph: {
    title: "O Level Computer Science Exam Workbook",
    description: "The O Level Computer Science 2210 exam workbook by Ibrahim Malick, with worked examples, mark schemes and QR-linked video lessons.",
    url: `${BASE_URL}/o-level/computer-science-book`,
    type: "website",
    images: ["/o-level-cs-workbook-cover.jpeg"],
  },
};

const BENEFITS = [
  { icon: "📖", title: "All 10 chapters, both papers", description: "Covers the complete Cambridge O Level Computer Science 2210 syllabus, Paper 1 and Paper 2." },
  { icon: "✍️", title: "Worked examples & mark schemes", description: "Exam-style questions worked through step by step, with the mark scheme alongside each one." },
  { icon: "📱", title: "QR-linked video lessons", description: "Scan a QR code next to a topic to watch the companion video lesson for it." },
  { icon: "💬", title: "WhatsApp study support", description: "Access to WhatsApp study support and free diagnostic resources that come with the book." },
];

export default function ComputerScienceWorkbookPage() {
  return (
    <section className="section">
      <TrackViewContent contentName="O Level CS Workbook" />
      <div className="container" style={{ maxWidth: 880 }}>
        <nav style={{ marginBottom: 20, color: "var(--muted)", fontSize: ".85rem" }}>
          <Link href="/" style={{ color: "var(--muted)" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/o-level" style={{ color: "var(--muted)" }}>O Level</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--navy)" }}>Computer Science Workbook</span>
        </nav>

        <div className="eyebrow">Study resource</div>
        <h1 className="title" style={{ marginTop: 8 }}>O Level Computer Science Interactive Exam Workbook</h1>
        <p className="lead">
          Written by Ibrahim Malick, educator and O Level Computer Science tutor at The Digital Tutor. Covers the
          complete Cambridge O Level Computer Science (2210) syllabus with worked examples, exam-style questions
          and mark schemes.
        </p>

        <div className="grid grid-2" style={{ marginTop: 32, alignItems: "center" }}>
          <div
            className="card"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(135deg,#eff6ff,#f5f3ff)", minHeight: 280 }}
          >
            <img
              src="/o-level-cs-workbook-cover.jpeg"
              alt="O Level Computer Science Interactive Exam Workbook cover"
              style={{ maxWidth: "100%", maxHeight: 360, borderRadius: 8, boxShadow: "0 8px 24px rgba(7,27,51,.15)", display: "block" }}
            />
          </div>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0", borderBottom: "1px solid #f0f4f8" }}>
                <span style={{ color: "var(--muted)" }}>Paperback</span>
                <strong style={{ color: "var(--navy)" }}>PKR 3,000</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0" }}>
                <span style={{ color: "var(--muted)" }}>Ebook</span>
                <strong style={{ color: "var(--navy)" }}>PKR 1,500</strong>
              </div>
            </div>
            <BookPurchaseLink baseUrl={BOOK_URL} title="O Level CS Workbook" className="btn btn-primary" >
              Buy the Workbook →
            </BookPurchaseLink>
            <p style={{ marginTop: 12, color: "var(--muted)", fontSize: ".8rem", lineHeight: 1.6 }}>
              Checkout and delivery are handled by PaperCraft Publishers — purchases are not processed on this
              site.
            </p>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: 40 }}>
          {BENEFITS.map((b) => (
            <article className="card" key={b.title}>
              <div className="icon">{b.icon}</div>
              <h3>{b.title}</h3>
              <p>{b.description}</p>
            </article>
          ))}
        </div>

        <p style={{ marginTop: 32, color: "var(--muted)", fontSize: ".82rem", lineHeight: 1.6 }}>
          This workbook is a study resource and does not guarantee a particular grade. The Digital Tutor is an
          independent tuition provider and is not affiliated with or endorsed by Cambridge University Press &amp;
          Assessment.
        </p>

        <div className="card" style={{ marginTop: 32, textAlign: "center", background: "#eaf1ff", borderColor: "#c9dcfb" }}>
          <p style={{ margin: 0, color: "var(--navy)" }}>
            Looking for live classes too?{" "}
            <Link href="/o-level/computer-science" style={{ color: "var(--blue)", fontWeight: 700 }}>
              Explore O Level Computer Science tuition →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
