import { neon } from "@neondatabase/serverless";

type NeonClient = ReturnType<typeof neon>;

let client: NeonClient | null = null;

function getClient(): NeonClient {
  // Lazy so the app builds and boots with an empty POSTGRES_URL; queries throw
  // a clear error at call time instead of crashing every route at import time.
  if (!client) {
    const url = (process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "").trim();
    if (!url) throw new Error("POSTGRES_URL is not set — database features are unavailable");
    client = neon(url);
  }
  return client;
}

// Rows are dynamically shaped, matching neon's own Record<string, any>[] typing;
// call sites narrow with casts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

export function sql(strings: TemplateStringsArray, ...params: unknown[]): Promise<Row[]> {
  return getClient()(strings, ...params) as Promise<Row[]>;
}
