import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "Track your SAT prep progress — diagnostic score, lectures watched, sessions joined, and recommended next steps.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
