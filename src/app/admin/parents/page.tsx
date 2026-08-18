import { AdminParentsPanel } from "@/components/admin/AdminParentsPanel";

export default function AdminSatParents() {
  return (
    <AdminParentsPanel
      program="sat"
      title="SAT Parent Accounts"
      description="Create parent logins for SAT students and link them. Parents can only see their own child's data. New parents are emailed a set-password link automatically — nothing to share by hand."
    />
  );
}
