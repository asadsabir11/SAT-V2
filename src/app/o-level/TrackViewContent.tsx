"use client";
import { useEffect } from "react";
import { trackViewContent } from "@/lib/analyticsClient";

export function TrackViewContent() {
  useEffect(() => {
    trackViewContent({ content_name: "O Level Founding Cohort", content_category: "o-level" });
  }, []);
  return null;
}
