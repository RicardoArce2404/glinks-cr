/**
 * Safe integer extraction from unknown query/param values.
 */
export function toInt(val: unknown, def: number): number {
  const n = parseInt(String(val ?? ""), 10);
  return isNaN(n) ? def : n;
}

/**
 * Safe string extraction from unknown query/param values (Express 5 compat).
 */
export function toStr(val: unknown): string | undefined {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return String(val[0] ?? "");
  return undefined;
}

/**
 * Force a string from Express 5 params (which can be string | string[]).
 */
export function paramStr(val: unknown, fallback = ""): string {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return String(val[0] ?? fallback);
  return fallback;
}
