import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AmnaShamimaAssignmentsList from "@/components/AmnaShamimaAssignmentsList";

export const metadata: Metadata = { title: "Assignments", robots: { index: false, follow: false } };

export default async function AmnaShamimaAssignmentsPage() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    redirect("/login?role=student&program=amna-shamima&next=/amna-shamima/portal/assignments");
  }
  return <AmnaShamimaAssignmentsList />;
}
