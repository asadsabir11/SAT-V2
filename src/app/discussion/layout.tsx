import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Q&A Board",
  description: "Ask SAT prep questions, get answers from your instructor, and help classmates on the Digital Tutor Q&A board.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
