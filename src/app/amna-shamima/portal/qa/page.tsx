import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AmnaShamimaQABoard from "@/components/AmnaShamimaQABoard";

export const metadata: Metadata = { title: "Q&A", robots: { index: false, follow: false } };

export default async function AmnaShamimaQAPage() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    redirect("/login?role=student&program=amna-shamima&next=/amna-shamima/portal/qa");
  }
  return <AmnaShamimaQABoard />;
}
