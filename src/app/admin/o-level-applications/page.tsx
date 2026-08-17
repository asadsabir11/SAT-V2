import { redirect } from "next/navigation";

// Superseded by /admin/o-level-access — self-serve registration replaced
// the parent-application funnel this page managed. Left unrouted from the
// admin dashboard rather than deleted, so the underlying records (and API)
// are still reachable directly if ever needed.
export default function AdminOLevelApplications() {
  redirect("/admin/o-level-access");
}
