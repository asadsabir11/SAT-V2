import { AdminParentsPanel } from "@/components/admin/AdminParentsPanel";

export default function AdminPunjab10thParents() {
  return (
    <AdminParentsPanel
      program="punjab-10th"
      title="10th Class Parent Accounts"
      description="Create parent logins for Punjab Board 10th Class students and link them. Parents can only see their own child's data. New parents are emailed a set-password link automatically — nothing to share by hand."
    />
  );
}
