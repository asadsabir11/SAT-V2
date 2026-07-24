import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?role=parent&next=/parent");
  if (session.role !== "parent") redirect("/");
  return <>{children}</>;
}
