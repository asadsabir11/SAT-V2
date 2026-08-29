import { ImageResponse } from "next/og";

// Site-wide social share card. The site previously declared
// twitter:card=summary_large_image with no image anywhere, so every share on
// WhatsApp/LinkedIn/Facebook rendered as a bare text link. Generated rather
// than a static asset so the wording stays in sync with the codebase.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "The Digital Tutor — SAT® Prep and Cambridge O Level tuition";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(145deg, #061729 0%, #071b33 45%, #0b2440 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* accent bar */}
        <div
          style={{
            display: "flex",
            width: 96,
            height: 8,
            borderRadius: 4,
            background: "linear-gradient(90deg, #155eef 0%, #18a999 100%)",
            marginBottom: 40,
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 700,
            color: "#5eead4",
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          The Digital Tutor
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.12,
            letterSpacing: -2,
            maxWidth: 940,
          }}
        >
          SAT® Prep and Cambridge O Level — Live Teaching, Global Access
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "rgba(255,255,255,.66)",
            marginTop: 28,
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Live online classes, weekly office hours, past-paper practice and parent progress reports.
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 44 }}>
          {["English Language", "Mathematics", "Computer Science", "SAT®"].map((s) => (
            <div
              key={s}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.14)",
                color: "#a8c0d8",
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
