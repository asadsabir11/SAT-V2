"use client";
import { useEffect } from "react";
import { trackViewContent } from "@/lib/analyticsClient";

export function TrackViewContent({ contentName = "O Level Founding Cohort" }: { contentName?: string }) {
  useEffect(() => {
    trackViewContent({ content_name: contentName, content_category: "o-level" });
  }, [contentName]);
  return null;
}
