"use client";
import { usePathname } from "next/navigation";
import { trackContactAction } from "@/lib/analyticsClient";

const NUMBER = process.env.NEXT_PUBLIC_OLEVEL_WHATSAPP_NUMBER;
const TUITION_MESSAGE = "Assalamu Alaikum. I would like information about The Digital Tutor's O Level founding cohort for my child.";
const BOOK_MESSAGE = "Assalamu Alaikum. I have a question about the O Level Computer Science workbook.";

// Scoped to O-Level pages only — the ad campaign's landing surface. Doesn't
// render at all if the number isn't configured yet (no fake/broken link).
// The book landing page gets its own label/message — "the founding cohort"
// doesn't make sense to someone here to ask about buying a book, not tuition.
export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const isOLevel = pathname?.startsWith("/o-level") ?? false;
  if (!isOLevel || !NUMBER) return null;

  const isBookPage = pathname === "/o-level/computer-science-book";
  const label = isBookPage ? "Ask a question about the workbook" : "Ask About the O Level Founding Cohort";
  const message = isBookPage ? BOOK_MESSAGE : TUITION_MESSAGE;
  const href = `https://wa.me/${NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackContactAction({ channel: "whatsapp" })}
      aria-label={`${label} on WhatsApp`}
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
      <span className="whatsapp-cta-label">{label}</span>
    </a>
  );
}
