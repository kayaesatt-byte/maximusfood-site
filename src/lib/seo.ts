import type { Metadata } from "next";
import { site } from "@/lib/site";
import { contentLocale, contentLocales, defaultLocale, htmlLang, locales, localePath, ogLocale, type Locale, type RouteKey } from "@/i18n/config";

/**
 * Sayfanın içerik kapsamı:
 *  - "ui"      → metni sözlükten gelen, gerçekten her dilde yazılmış sayfa (ana sayfa, sipariş, bölge dizini, hesap).
 *                Beş dilin hepsi hreflang'de listelenir ve dizine girer.
 *  - "content" → uzun metni yalnızca Hollandaca ve Türkçe yazılmış sayfa (bölge detayları, blog yazıları).
 *                Diğer dillerde sayfa yine açılır ama canonical asıl dile bakar ve sayfa dizine girmez;
 *                makine çevirisi kopya/ince içerik cezası doğurmasın diye.
 */
export type SeoScope = "ui" | "content" | readonly Locale[];

/** Kapsamın dizine giren dilleri. Dizi verilirse yalnızca o diller (örn. bölge sayfaları: nl, fr, tr). */
function scopeLocales(scope: SeoScope): readonly Locale[] {
  if (scope === "ui") return locales;
  if (scope === "content") return contentLocales;
  return scope;
}

export function alternatesFor(lang: Locale, route?: RouteKey, rest?: string, query?: string, scope: SeoScope = "ui"): NonNullable<Metadata["alternates"]> {
  const list = scopeLocales(scope);
  const languages: Record<string, string> = {};
  for (const l of list) languages[htmlLang[l]] = localePath(l, route, rest, query);
  languages["x-default"] = localePath(defaultLocale, route, rest, query);
  const self = list.includes(lang) ? lang : contentLocale[lang];
  return { canonical: localePath(self, route, rest, query), languages };
}

/** Çevirisi olmayan dilde gösterilen uzun içerik sayfaları dizine girmez. */
export function robotsFor(lang: Locale, scope: SeoScope = "ui"): Metadata["robots"] {
  return scopeLocales(scope).includes(lang) ? { index: true, follow: true } : { index: false, follow: true };
}

const DEFAULT_OG_IMAGE = "/media/hero/hero-warehouse.jpg";

/**
 * Open Graph + Twitter kartı: sayfaya özel başlık, açıklama, kanonik URL (og:url) ve dil (og:locale).
 * Bir sayfa openGraph verdiğinde Next.js layout'takini tamamen değiştirir; bu yüzden her sayfa bunu çağırır.
 * `url`, sayfanın canonical yoludur (alternatesFor(...).canonical ile aynı).
 */
export function socialFor(opts: { lang: Locale; url: string; title: string; description: string; image?: string; type?: "website" | "article"; article?: { publishedTime?: string; modifiedTime?: string } }): Pick<Metadata, "openGraph" | "twitter"> {
  const image = opts.image ?? DEFAULT_OG_IMAGE;
  const url = absoluteUrl(opts.url);
  return {
    openGraph: {
      type: opts.type ?? "website",
      siteName: site.name,
      locale: ogLocale[opts.lang],
      url,
      title: opts.title,
      description: opts.description,
      images: [{ url: image }],
      ...(opts.type === "article" && opts.article ? opts.article : {}),
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images: [image] },
  };
}

export function absoluteUrl(path: string): string {
  return `${site.url}${path === "/" ? "" : path}`;
}

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Yapay zekâ arama/asistan tarayıcıları: açıkça izinli (ChatGPT, Claude, Perplexity, Gemini, Apple, Bing).
 * Kuralları "*" grubuyla aynıdır; ayrı grup, bir tarayıcının "*" yerine kendi adını araması içindir.
 */
export const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
] as const;
