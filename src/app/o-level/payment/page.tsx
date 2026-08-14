import type { Metadata } from "next";
import { Suspense } from "react";
import PaymentPageClient from "./PaymentPageClient";

export const metadata: Metadata = {
  title: "Reserve Your Founding Cohort Seat",
  robots: { index: false, follow: false },
};

export default function OLevelPaymentPage() {
  return (
    <Suspense fallback={<section className="section"><div className="container"><div className="card" style={{ maxWidth: 400 }}><p>Loading…</p></div></div></section>}>
      <PaymentPageClient />
    </Suspense>
  );
}
