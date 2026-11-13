import { llmsText } from "@/lib/llms";

/** /llms.txt: yapay zekâ asistanları için düz metin özet (src/lib/llms.ts). Derlemede üretilir. */
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsText(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
