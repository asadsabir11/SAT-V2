import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

// Account pages have no search value and shouldn't compete with real
// content pages for crawl attention or rank for brand searches — split
// into a server component (this file) + a client component (LoginForm)
// specifically so this page can carry metadata at all, since a page whose
// default export uses hooks directly cannot also export `metadata`.
export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
