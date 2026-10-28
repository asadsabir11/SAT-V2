"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface RegistrationRow {
  id: string;
  email: string;
  name: string;
  program: string;
  created_at: string;
  redeemed: boolean;
}

const PROGRAM_LABELS: Record<string, string> = { "o-level": "O Level", "punjab-9th": "9th Class", "a-level": "A Level" };

function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

export default function AdminBookRegistrations() {
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "redeemed" | "pending">("all");

  useEffect(() => {
    fetch("/api/admin/book-registrations").then((r) => r.json()).then((d) => setRows(d.registrations ?? [])).finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r) => filter === "all" || (filter === "redeemed" ? r.redeemed : !r.redeemed));
  const redeemedCount = rows.filter((r) => r.redeemed).length;
  const pendingCount = rows.filter((r) => !r.redeemed).length;

  return (
    <section className="section">
      <div className="container">
        <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
        <h1 className="title" style={{ marginTop: 8 }}>Book Redemption Students</h1>
        <p style={{ color: "var(--muted)", marginBottom: 28 }}>
          Students who registered through the <code>/redeem</code> book-code flow — separate from the regular leads tables, since these aren&apos;t marketing leads needing follow-up.
        </p>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <button onClick={() => setFilter("all")} className="btn" style={{ border: filter === "all" ? "2px solid var(--blue)" : "1.5px solid #cbd7e5", background: filter === "all" ? "#eaf1ff" : "#fff" }}>All ({rows.length})</button>
          <button onClick={() => setFilter("redeemed")} className="btn" style={{ border: filter === "redeemed" ? "2px solid #15803d" : "1.5px solid #cbd7e5", background: filter === "redeemed" ? "#f0fdf4" : "#fff" }}>Code Redeemed ({redeemedCount})</button>
          <button onClick={() => setFilter("pending")} className="btn" style={{ border: filter === "pending" ? "2px solid #b45309" : "1.5px solid #cbd7e5", background: filter === "pending" ? "#fef3c7" : "#fff" }}>Not Redeemed Yet ({pendingCount})</button>
        </div>

        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No registrations yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Program</th>
                  <th>Registered</th>
                  <th>Code Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{PROGRAM_LABELS[r.program] ?? r.program}</td>
                    <td>{fmtDate(r.created_at)}</td>
                    <td>
                      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".78rem", fontWeight: 700, background: r.redeemed ? "#f0fdf4" : "#fef3c7", color: r.redeemed ? "#15803d" : "#92400e" }}>
                        {r.redeemed ? "Redeemed ✓" : "Not redeemed yet"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
