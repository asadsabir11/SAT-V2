import type { Metadata } from "next";
import { PageHero } from "@/components/site";
import { OLevelEnrollmentForm } from "@/components/forms";
import { getOLevelSubjects } from "@/lib/academy/data";

export const metadata: Metadata = {
  title: "O Level Enrollment",
  description: "Join the founding O Level / IGCSE cohort at The Digital Tutor Academy — live classes, office hours, and parent reporting.",
};

export default async function OLevelEnroll({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; plan?: string }>;
}) {
  const { subject, plan } = await searchParams;
  const subjects = getOLevelSubjects().map((s) => ({ slug: s.slug, name: s.name }));

  return (
    <>
      <PageHero eyebrow="O Level enrollment" title="Join the founding Cambridge O Level cohort.">
        Tell us about your student and which subjects you&apos;re interested in — we&apos;ll follow up on WhatsApp to confirm your schedule and founder pricing.
      </PageHero>
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <OLevelEnrollmentForm subjects={subjects} defaultSubject={subject} defaultPlan={plan} />
        </div>
      </section>
    </>
  );
}
