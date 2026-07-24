import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Digital Tutor SAT Prep account to access your dashboard, lectures, and live sessions.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
