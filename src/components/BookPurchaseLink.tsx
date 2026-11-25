"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { trackBookPurchaseClick } from "@/lib/analyticsClient";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;

// Passes through whichever UTM/fbclid params the visitor arrived with (e.g.
// from a Facebook/Instagram ad click that landed on this page) onto the
// outbound PaperCraft link, so the publisher's own analytics can also
// attribute the sale back to that campaign — same idea as the O-Level
// registration flow's own UTM capture, just forwarded instead of stored.
// Falls back to a static tag identifying this page as the referrer when the
// visitor arrived with no campaign params at all (e.g. direct/organic).
function BuyButtonInner({ baseUrl, title, className, children }: { baseUrl: string; title: string; className?: string; children: React.ReactNode }) {
  const params = useSearchParams();
  const url = new URL(baseUrl);
  let hasIncoming = false;
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) {
      url.searchParams.set(key, value);
      hasIncoming = true;
    }
  }
  if (!hasIncoming) {
    url.searchParams.set("utm_source", "thedigitaltutor");
    url.searchParams.set("utm_medium", "referral");
    url.searchParams.set("utm_campaign", "cs-workbook-page");
  }

  return (
    <a
      href={url.toString()}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={() => trackBookPurchaseClick({ title })}
    >
      {children}
    </a>
  );
}

export function BookPurchaseLink(props: { baseUrl: string; title: string; className?: string; children: React.ReactNode }) {
  return (
    <Suspense fallback={<a href={props.baseUrl} target="_blank" rel="noreferrer" className={props.className}>{props.children}</a>}>
      <BuyButtonInner {...props} />
    </Suspense>
  );
}
