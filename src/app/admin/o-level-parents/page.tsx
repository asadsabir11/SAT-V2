import { AdminParentsPanel } from "@/components/admin/AdminParentsPanel";

export default function AdminOLevelParents() {
  return (
    <AdminParentsPanel
      program="o-level"
      title="O Level Parent Accounts"
      description="Create parent logins for O Level students and link them. Parents can only see their own child's data. New parents are emailed a set-password link automatically — nothing to share by hand."
    />
  );
}
