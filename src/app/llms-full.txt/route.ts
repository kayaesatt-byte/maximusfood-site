import { llmsFullText } from "@/lib/llms";

/** /llms-full.txt: yapay zekâ asistanları için düz metin özet (src/lib/llms.ts). Derlemede üretilir. */
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFullText(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
