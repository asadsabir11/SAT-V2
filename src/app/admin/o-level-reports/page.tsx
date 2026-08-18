import { AdminReportsPanel } from "@/components/admin/AdminReportsPanel";

export default function AdminOLevelReports() {
  return (
    <AdminReportsPanel
      program="o-level"
      title="O Level Parent Reports"
      description="Generate weekly reports for O Level students, add coach notes, approve, and send via email + WhatsApp."
    />
  );
}
