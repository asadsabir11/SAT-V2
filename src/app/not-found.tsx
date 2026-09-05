import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function NotFound() {
  const session = await getSession();
  const dashboardHref = session?.role === "student" && session.program === "punjab-9th"
    ? "/punjab-board-9th-class/portal"
    : "/dashboard";

  return (
    <section className="section" style={{ minHeight: "60vh", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ textAlign: "center", maxWidth: 560 }}>
        <div style={{ fontSize: "4rem", marginBottom: 16 }}>404</div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#071b33", margin: "0 0 12px", letterSpacing: "-.03em" }}>
          Page not found
        </h1>
        <p style={{ color: "#6b7c93", lineHeight: 1.7, marginBottom: 32, fontSize: ".95rem" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Use the links below to get back on track.
        </p>
        <div className="actions" style={{ justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">Go to homepage</Link>
          <Link href={dashboardHref} className="btn btn-secondary">My dashboard</Link>
          <Link href="/discussion" className="btn btn-secondary">Q&amp;A board</Link>
        </div>
      </div>
    </section>
  );
}
