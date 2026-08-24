"use client";
import type { CSSProperties, ReactNode } from "react";

// Wraps the actual download link so we can fire a tracking beacon on click
// without interfering with the browser's native file download — the POST
// is fire-and-forget and never blocks or delays the download.
export function WorkbookDownloadLink({
  id, href, fileName, className, style, children,
}: {
  id: string;
  href: string;
  fileName: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  function trackDownload() {
    fetch(`/api/workbooks/${id}/download`, { method: "POST" }).catch(() => {});
  }

  return (
    <a href={href} download={fileName} onClick={trackDownload} className={className} style={style}>
      {children}
    </a>
  );
}
