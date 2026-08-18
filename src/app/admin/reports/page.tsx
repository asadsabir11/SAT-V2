import { AdminReportsPanel } from "@/components/admin/AdminReportsPanel";

export default function AdminSatReports() {
  return (
    <AdminReportsPanel
      program="sat"
      title="SAT Parent Reports"
      description="Generate weekly reports for SAT students, add coach notes, approve, and send via email + WhatsApp."
    />
  );
}
