/** "How did you hear about us?" on the registration form: fixed answers plus an optional free text (e.g. a salesperson's name). */
export const HEARD_FROM = ["salesperson", "whatsapp", "social", "google", "acquaintance", "other"] as const;
export type HeardFrom = (typeof HEARD_FROM)[number];

export function parseHeardFrom(body: Record<string, unknown>): { heardFrom?: HeardFrom; heardFromDetail?: string } {
  const raw = typeof body.heardFrom === "string" ? body.heardFrom.trim() : "";
  const heardFrom = (HEARD_FROM as readonly string[]).includes(raw) ? (raw as HeardFrom) : undefined;
  const detail = typeof body.heardFromDetail === "string" ? body.heardFromDetail.replace(/\s+/g, " ").trim().slice(0, 120) : "";
  return { ...(heardFrom ? { heardFrom } : {}), ...(detail ? { heardFromDetail: detail } : {}) };
}
