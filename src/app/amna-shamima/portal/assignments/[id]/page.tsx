import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AmnaShamimaAssignmentDetail from "@/components/AmnaShamimaAssignmentDetail";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AmnaShamimaAssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    redirect("/login?role=student&program=amna-shamima&next=/amna-shamima/portal/assignments");
  }
  const { id } = await params;
  return <AmnaShamimaAssignmentDetail id={id} />;
}
