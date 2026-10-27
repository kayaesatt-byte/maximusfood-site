const digits = (p: string) => p.replace(/[^\d]/g, "");
/** The same number however it is written: "+32 470…", "0032 470…" and "0470…" give "32470…". */
export const phoneDigits = (p: string) => digits(p).replace(/^00/, "").replace(/^0/, "32");
/** A phone number has 8 to 15 digits (with or without +32 / 0). */
export const validPhone = (p: string) => digits(p).length >= 8 && digits(p).length <= 15;
/** Other WhatsApp numbers of the business: separated by commas, semicolons or new lines; at most 5, no duplicates. */
export function parsePhones(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  const out: string[] = [];
  for (const p of raw.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean)) {
    if (validPhone(p) && !out.some((o) => phoneDigits(o) === phoneDigits(p))) out.push(p.slice(0, 30));
  }
  return out.slice(0, 5);
}
