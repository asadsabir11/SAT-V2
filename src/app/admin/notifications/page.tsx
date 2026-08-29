"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";

type NotifType = "registration" | "access_request" | "scholarship";

interface NotificationItem {
  id: string;
  type: NotifType;
  title: string;
  body: string | null;
  link: string | null;
  created_at: string;
}

const NOTIF_ICONS: Record<NotifType, string> = {
  registration: "🧑‍🎓",
  access_request: "🔑",
  scholarship: "🎓",
};

const NOTIF_COLORS: Record<NotifType, string> = {
  registration: "linear-gradient(135deg,#155eef,#18a999)",
  access_request: "linear-gradient(135deg,#059669,#10b981)",
  scholarship: "linear-gradient(135deg,#b45309,#f59e0b)",
};

const TABS: [string, NotifType | "all"][] = [
  ["All", "all"],
  ["Registrations", "registration"],
  ["Access requests", "access_request"],
  ["Scholarships", "scholarship"],
];

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  // Captured once at load, before mark-seen wipes the server-side value — so
  // the blue "unread" highlight stays visible for this whole page visit
  // instead of vanishing the instant the page marks things seen.
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<NotifType | "all">("all");

  useEffect(() => {
    fetch("/api/admin/notifications").then(r => r.json()).then(d => {
      setItems(d.notifications ?? []);
      setLastSeenAt(d.lastSeenAt ?? null);
      if ((d.unreadCount ?? 0) > 0) {
        fetch("/api/admin/notifications/mark-seen", { method: "POST" }).catch(() => {});
      }
    }).finally(() => setLoading(false));
  }, []);

  const counts: Record<NotifType | "all", number> = {
    all: items.length,
    registration: items.filter(n => n.type === "registration").length,
    access_request: items.filter(n => n.type === "access_request").length,
    scholarship: items.filter(n => n.type === "scholarship").length,
  };
  const visible = tab === "all" ? items : items.filter(n => n.type === tab);

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Notifications</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
            New registrations, access requests, and scholarship applications — all in one place.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {TABS.map(([label, value]) => {
            const active = tab === value;
            return (
              <button key={value} onClick={() => setTab(value)} style={{ padding: "8px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: active ? "2px solid #155eef" : "2px solid #e8eef6", background: active ? "#eff6ff" : "#fff", color: active ? "#155eef" : "#6b7c93" }}>
                {label}{counts[value] > 0 ? ` (${counts[value]})` : ""}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : visible.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 56 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔔</div>
            <p style={{ color: "#6b7c93" }}>{tab === "all" ? "Nothing yet — you're all caught up." : "Nothing here yet."}</p>
          </div>
        ) : (
          <div className="card notif-panel" style={{ padding: 0, overflow: "hidden" }}>
            {visible.map((n, i) => {
              const isUnread = !lastSeenAt || new Date(n.created_at) > new Date(lastSeenAt);
              const row = (
                <div className="notif-item" style={{ padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start", background: isUnread ? "#eff6ff" : "#fff", borderBottom: i < visible.length - 1 ? "1px solid #f0f4f8" : "none" }}>
                  {isUnread ? (
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#155eef", flexShrink: 0, marginTop: 8 }} />
                  ) : (
                    <span style={{ width: 9, flexShrink: 0 }} />
                  )}
                  <span style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: NOTIF_COLORS[n.type], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", boxShadow: "0 4px 10px rgba(7,27,51,.15)" }}>
                    {NOTIF_ICONS[n.type]}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                      <p style={{ margin: 0, fontWeight: isUnread ? 800 : 600, color: "#071b33", fontSize: ".92rem", lineHeight: 1.4 }}>{n.title}</p>
                      <span style={{ color: "#a0aec0", fontSize: ".76rem", whiteSpace: "nowrap", flexShrink: 0 }}>{timeAgo(n.created_at)}</span>
                    </div>
                    {n.body && (
                      <p style={{
                        margin: "4px 0 0", color: "#6b7c93", fontSize: ".85rem", lineHeight: 1.5,
                        overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
                        WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                      } as CSSProperties}>
                        {n.body}
                      </p>
                    )}
                  </div>
                </div>
              );
              return n.link ? (
                <Link key={n.id} href={n.link} style={{ textDecoration: "none", display: "block" }}>{row}</Link>
              ) : (
                <div key={n.id}>{row}</div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
