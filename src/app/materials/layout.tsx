import type { Metadata } from "next";

// materials/page.tsx is a client component, so its metadata (including the
// canonical it was previously missing) has to live in a layout instead.
export const metadata: Metadata = {
  title: "Study Materials",
  description: "Free SAT and Cambridge O Level study materials, workbooks, and practice resources from The Digital Tutor.",
  alternates: { canonical: "/materials" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
