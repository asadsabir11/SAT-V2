import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Sessions",
  description: "Join live SAT prep classes, Q&A calls, and tutoring sessions with your instructor.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
