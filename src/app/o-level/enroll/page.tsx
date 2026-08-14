import type { Metadata } from "next";
import { PageHero } from "@/components/site";
import { OLevelEnrollmentForm } from "@/components/forms";

export const metadata: Metadata = {
  title: "Apply for the O Level Founding Cohort",
  description: "Apply for The Digital Tutor's O Level Founding Cohort — live classes, office hours, and parent reporting.",
};

export default async function OLevelEnroll({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;

  return (
    <>
      <PageHero eyebrow="O Level enrollment" title="Apply for the O Level Founding Cohort" backHref="/o-level" backLabel="O Level">
        Tell us about your student — we&apos;ll show you payment options for the founding cohort next.
      </PageHero>
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <OLevelEnrollmentForm defaultSubject={subject} />
        </div>
      </section>
    </>
  );
}
