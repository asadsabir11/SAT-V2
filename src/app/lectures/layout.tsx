import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lectures",
  description: "Watch recorded SAT prep lectures on demand — Math, Reading & Writing, and test strategy, all at your own pace.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
