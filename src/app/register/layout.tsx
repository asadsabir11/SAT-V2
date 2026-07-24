import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Registration",
  description: "Create your Digital Tutor SAT Prep account and get matched with the right cohort, diagnostic, and study plan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
