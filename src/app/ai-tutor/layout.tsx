import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tutor",
  description: "Get instant SAT help from an AI tutor — ask any Math or Reading & Writing question and get a clear explanation.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
