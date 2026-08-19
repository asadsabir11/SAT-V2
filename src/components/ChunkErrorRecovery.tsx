"use client";
import { useEffect } from "react";

const RELOAD_FLAG = "dt_chunk_reload_at";
const RELOAD_COOLDOWN_MS = 10_000; // don't reload more than once per 10s — avoids a loop if reloading doesn't actually fix it

function looksLikeChunkError(message: string): boolean {
  return /loading chunk [\w.-]+ failed|chunkloaderror|failed to fetch dynamically imported module|error loading dynamically imported module/i.test(message);
}

function tryReload() {
  const last = Number(sessionStorage.getItem(RELOAD_FLAG) ?? 0);
  if (Date.now() - last < RELOAD_COOLDOWN_MS) return;
  sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  window.location.reload();
}

// A page left open across a new deploy can try to fetch a JS chunk that no
// longer exists on the server (the old build's asset was replaced) — this
// shows up in the browser as a generic load/connection failure with no
// application error at all, since the request never reaches our code.
// Recovering with one automatic reload picks up the current build's fresh
// asset references and clears it.
export function ChunkErrorRecovery() {
  useEffect(() => {
    function onError(e: ErrorEvent) {
      if (looksLikeChunkError(e.message ?? "")) tryReload();
    }
    function onResourceError(e: Event) {
      const target = e.target as HTMLElement | null;
      if (target instanceof HTMLScriptElement && target.src.includes("/_next/static/")) tryReload();
    }
    function onRejection(e: PromiseRejectionEvent) {
      const reason = e.reason;
      const message = typeof reason === "string" ? reason : reason?.message ?? "";
      if (looksLikeChunkError(message)) tryReload();
    }

    window.addEventListener("error", onError);
    window.addEventListener("error", onResourceError, true); // capture phase — resource load errors don't bubble
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("error", onResourceError, true);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
