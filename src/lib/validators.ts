// Shared client+server validation rules — no DOM/React deps, no DB import,
// so this is safe to import from both "use client" forms and API routes.
// Client-side checks give instant feedback; server-side checks are what
// actually enforce the rule, since a form isn't the only way to hit an API.

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function passwordStrengthError(v: string): string {
  if (!v) return "Required";
  if (v.length < 8) return "Minimum 8 characters";
  if (!/[A-Za-z]/.test(v)) return "Must contain at least one letter";
  if (!/[0-9]/.test(v)) return "Must contain at least one number";
  return "";
}
