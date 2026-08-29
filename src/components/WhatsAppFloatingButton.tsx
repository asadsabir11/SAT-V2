"use client";
import { usePathname } from "next/navigation";
import { trackContactAction } from "@/lib/analyticsClient";

const NUMBER = process.env.NEXT_PUBLIC_OLEVEL_WHATSAPP_NUMBER;
const MESSAGE = "Assalamu Alaikum. I would like information about The Digital Tutor's O Level founding cohort for my child.";

// Scoped to O-Level pages only — the ad campaign's landing surface. Doesn't
// render at all if the number isn't configured yet (no fake/broken link).
export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const isOLevel = pathname?.startsWith("/o-level") ?? false;
  if (!isOLevel || !NUMBER) return null;

  const href = `https://wa.me/${NUMBER}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackContactAction({ channel: "whatsapp" })}
      aria-label="Ask About the O Level Founding Cohort on WhatsApp"
      style={{
        position: "fixed",
        right: 18,
        bottom: "max(18px, env(safe-area-inset-bottom))",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#25d366",
        color: "#fff",
        borderRadius: 999,
        padding: "12px 18px",
        fontWeight: 800,
        fontSize: ".85rem",
        textDecoration: "none",
        boxShadow: "0 6px 20px rgba(37,211,102,.4)",
      }}
    >
      <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>💬</span>
      <span className="whatsapp-cta-label">Ask About the O Level Founding Cohort</span>
    </a>
  );
}
