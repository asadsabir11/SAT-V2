"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type ApplicationStatus =
  | "new_application" | "contact_required" | "assessment_scheduled" | "assessment_completed"
  | "awaiting_payment" | "payment_submitted" | "payment_verified" | "enrolled"
  | "waiting_list" | "declined" | "refunded" | "cancelled";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "new_application", "contact_required", "assessment_scheduled", "assessment_completed",
  "awaiting_payment", "payment_submitted", "payment_verified", "enrolled",
  "waiting_list", "declined", "refunded", "cancelled",
];

const STATUS_META: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  new_application: { label: "New application", bg: "#f1f5f9", color: "#475569" },
  contact_required: { label: "Contact required", bg: "#fef3c7", color: "#92400e" },
  assessment_scheduled: { label: "Assessment scheduled", bg: "#e0e7ff", color: "#3730a3" },
  assessment_completed: { label: "Assessment completed", bg: "#e0e7ff", color: "#3730a3" },
  awaiting_payment: { label: "Awaiting payment", bg: "#fef3c7", color: "#92400e" },
  payment_submitted: { label: "Payment submitted", bg: "#fef3c7", color: "#92400e" },
  payment_verified: { label: "Payment verified", bg: "#d1fae5", color: "#065f46" },
  enrolled: { label: "Enrolled", bg: "#dcfce7", color: "#15803d" },
  waiting_list: { label: "Waiting list", bg: "#f1f5f9", color: "#475569" },
  declined: { label: "Declined", bg: "#fee2e2", color: "#991b1b" },
  refunded: { label: "Refunded", bg: "#fee2e2", color: "#991b1b" },
  cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#991b1b" },
};

const SUBJECT_LABELS: Record<string, string> = {
  "english-language": "English Language",
  "mathematics": "Mathematics",
  "english-language+mathematics": "English + Mathematics",
  "computer-science-waitlist": "Computer Science (waitlist)",
  "islamiyat-waitlist": "Islamiyat (waitlist)",
  "pakistan-studies-waitlist": "Pakistan Studies (waitlist)",
};

interface Application {
  id: string;
  parent_name: string;
  parent_email: string;
  parent_whatsapp: string;
  student_name: string;
  student_grade: string;
  school_name: string | null;
  city: string;
  subject: string;
  preferred_class_time: string;
  target_exam_session: string;
  source: string | null;
  utm_source: string | null;
  status: ApplicationStatus;
  amount_due: number | null;
  payment_method: string | null;
  amount_paid: number | null;
  transaction_reference: string | null;
  payment_screenshot_url: string | null;
  admin_notes: string | null;
  created_at: string;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminOLevelApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/admin/o-level-applications")
      .then((r) => r.json())
      .then((d) => setApplications(d.applications ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function changeStatus(id: string, status: ApplicationStatus) {
    setBusy(id);
    await fetch(`/api/admin/o-level-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    load();
  }

  async function saveNotes(id: string) {
    setBusy(id);
    await fetch(`/api/admin/o-level-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: notesDraft }),
    });
    setBusy(null);
    load();
  }

  async function sendWelcome(id: string) {
    if (!confirm("Send the 'Payment Verified — Welcome' email now?")) return;
    setBusy(id);
    await fetch(`/api/admin/o-level-applications/${id}/send-welcome`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    setBusy(null);
    alert("Welcome email sent.");
  }

  const cities = Array.from(new Set(applications.map((a) => a.city))).sort();
  const sources = Array.from(new Set(applications.map((a) => a.source || a.utm_source).filter(Boolean))) as string[];

  const filtered = applications.filter((a) => {
    if (subjectFilter !== "all" && a.subject !== subjectFilter) return false;
    if (cityFilter !== "all" && a.city !== cityFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (sourceFilter !== "all" && (a.source || a.utm_source) !== sourceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.parent_name.toLowerCase().includes(q) || a.student_name.toLowerCase().includes(q) || a.parent_email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>O Level Applications</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>{applications.length} total application{applications.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e8eef6", fontSize: ".85rem" }}>
            <option value="all">All subjects</option>
            {Object.entries(SUBJECT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e8eef6", fontSize: ".85rem" }}>
            <option value="all">All cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e8eef6", fontSize: ".85rem" }}>
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e8eef6", fontSize: ".85rem" }}>
            <option value="all">All sources</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email…" style={{ flex: 1, minWidth: 200, padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e8eef6", fontSize: ".85rem" }} />
        </div>

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <p style={{ color: "#6b7c93" }}>No applications match your filters.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map((a) => {
              const meta = STATUS_META[a.status];
              const expanded = expandedId === a.id;
              return (
                <div key={a.id} className="card" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, color: "#071b33" }}>{a.student_name}</span>
                        <span style={{ color: "#6b7c93", fontSize: ".82rem" }}>Grade {a.student_grade}</span>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".7rem", fontWeight: 800, background: meta.bg, color: meta.color }}>{meta.label}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: ".85rem", color: "#344054" }}>
                        {SUBJECT_LABELS[a.subject] ?? a.subject} · {a.city} · Parent: {a.parent_name}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: ".78rem", color: "#a0aec0" }}>Applied {fmtDate(a.created_at)} · {a.parent_whatsapp} · {a.parent_email}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <select
                        value={a.status}
                        disabled={busy === a.id}
                        onChange={(e) => changeStatus(a.id, e.target.value as ApplicationStatus)}
                        style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e8eef6", fontSize: ".8rem" }}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                      </select>
                      {(a.status === "payment_verified" || a.status === "enrolled") && (
                        <button onClick={() => sendWelcome(a.id)} disabled={busy === a.id} style={{ padding: "6px 12px", borderRadius: 8, background: "#155eef", color: "#fff", border: "none", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                          Send Welcome
                        </button>
                      )}
                      <button onClick={() => { setExpandedId(expanded ? null : a.id); setNotesDraft(a.admin_notes ?? ""); }} style={{ padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", color: "#6b7c93" }}>
                        {expanded ? "Hide details" : "Details"}
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #edf2f7" }}>
                      <div className="grid grid-3" style={{ marginBottom: 14, fontSize: ".85rem" }}>
                        <div><strong>Preferred time:</strong> {a.preferred_class_time}</div>
                        <div><strong>Target session:</strong> {a.target_exam_session}</div>
                        <div><strong>School:</strong> {a.school_name || "—"}</div>
                        <div><strong>Amount due:</strong> {a.amount_due ? `PKR ${a.amount_due.toLocaleString()}` : "—"}</div>
                        <div><strong>Payment method:</strong> {a.payment_method || "—"}</div>
                        <div><strong>Amount submitted:</strong> {a.amount_paid ? `PKR ${a.amount_paid.toLocaleString()}` : "—"}</div>
                        <div><strong>Transaction ref:</strong> {a.transaction_reference || "—"}</div>
                        <div><strong>Source:</strong> {a.source || a.utm_source || "—"}</div>
                        <div>
                          <strong>Screenshot:</strong>{" "}
                          {a.payment_screenshot_url ? (
                            <a href={`/api/admin/o-level-applications/${a.id}/screenshot`} target="_blank" rel="noreferrer" style={{ color: "#155eef" }}>View →</a>
                          ) : "—"}
                        </div>
                      </div>
                      <div className="field" style={{ marginBottom: 10 }}>
                        <label>Admin notes</label>
                        <textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} rows={2} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e8eef6", fontFamily: "inherit", resize: "vertical" }} />
                      </div>
                      <button onClick={() => saveNotes(a.id)} disabled={busy === a.id} style={{ padding: "6px 14px", borderRadius: 8, background: "#155eef", color: "#fff", border: "none", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                        Save notes
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
