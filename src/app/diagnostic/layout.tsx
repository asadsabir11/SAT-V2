import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free SAT Diagnostic",
  description: "Take our free 10-question SAT diagnostic to identify your baseline score and the exact skills to prioritize.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
