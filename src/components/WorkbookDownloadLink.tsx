"use client";
import type { CSSProperties, ReactNode } from "react";
import { trackWorkbookDownload } from "@/lib/analyticsClient";

// Wraps the actual download link so we can fire a tracking beacon on click
// without interfering with the browser's native file download — the POST
// is fire-and-forget and never blocks or delays the download.
export function WorkbookDownloadLink({
  id, href, fileName, title, className, style, children,
}: {
  id: string;
  href: string;
  fileName: string;
  /** Workbook title, reported to GA4/Meta. Falls back to the file name. */
  title?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  function trackDownload() {
    fetch(`/api/workbooks/${id}/download`, { method: "POST" }).catch(() => {});
    trackWorkbookDownload({ title: title ?? fileName });
  }

  return (
    <a href={href} download={fileName} onClick={trackDownload} className={className} style={style}>
      {children}
    </a>
  );
}
