import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { regions } from "@/data/regions";
import { categories } from "@/data/categories";
import { productSlug } from "@/data/catalog";
import { products } from "@/data/products";
import { getPosts, translatedPost } from "@/data/blog";
import { contentLocales, defaultLocale, htmlLang, localePath, locales, type Locale } from "@/i18n/config";

/**
 * Site haritası.
 * Arayüz sayfaları (ana sayfa, sipariş, bölge dizini) beş dilde listelenir.
 * Uzun içerik sayfaları (bölge detayları, blog yazıları) yalnızca yazıldıkları dillerde
 * (Hollandaca, Türkçe) listelenir; diğer dillerdeki karşılıkları noindex olduğu için haritaya girmez.
 * Kategori süzgeçleri (?categorie=) haritada yok: canonical'ları sipariş sayfasının kendisidir.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const abs = (p: string) => `${site.url}${p === "/" ? "" : p}`;
  const entries: MetadataRoute.Sitemap = [];
  const altOf = (list: readonly Locale[]) => (route?: Parameters<typeof localePath>[1], rest?: string, q?: string) => ({
    languages: { ...Object.fromEntries(list.map((l) => [htmlLang[l], abs(localePath(l, route, rest, q))])), "x-default": abs(localePath(defaultLocale, route, rest, q)) },
  });
  const uiAlt = altOf(locales);
  const contentAlt = altOf(contentLocales);

  for (const lang of locales) {
    const home = lang === "nl" ? 1 : 0.8;
    entries.push({ url: abs(localePath(lang)), lastModified: now, changeFrequency: "weekly", priority: home, alternates: uiAlt() });
    entries.push({ url: abs(localePath(lang, "order")), lastModified: now, changeFrequency: "weekly", priority: 0.9, alternates: uiAlt("order") });
    entries.push({ url: abs(localePath(lang, "regions")), lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: uiAlt("regions") });
    entries.push({ url: abs(localePath(lang, "privacy")), lastModified: now, changeFrequency: "yearly", priority: 0.2, alternates: uiAlt("privacy") });
    entries.push({ url: abs(localePath(lang, "products")), lastModified: now, changeFrequency: "weekly", priority: 0.9, alternates: uiAlt("products") });
  }

  for (const lang of contentLocales) {
    for (const r of regions) {
      entries.push({ url: abs(localePath(lang, "regions", r.slug)), lastModified: now, changeFrequency: "monthly", priority: lang === "nl" ? 0.8 : 0.6, alternates: contentAlt("regions", r.slug) });
    }
    // Kategori ve ürün sayfaları yalnızca metni yazılmış dillerde haritaya girer;
    // Fransızca ve İngilizce karşılıkları noindex + canonical ile Hollandacaya bakar.
    for (const c of categories) {
      entries.push({ url: abs(localePath(lang, "products", c.slug)), lastModified: now, changeFrequency: "weekly", priority: lang === "nl" ? 0.85 : 0.7, alternates: contentAlt("products", c.slug) });
    }
    for (const p of products) {
      const rest = `${p.category}/${productSlug(p)}`;
      entries.push({ url: abs(localePath(lang, "products", rest)), lastModified: now, changeFrequency: "monthly", priority: lang === "nl" ? 0.6 : 0.5, alternates: contentAlt("products", rest) });
    }
    entries.push({ url: abs(localePath(lang, "blog")), lastModified: now, changeFrequency: "weekly", priority: 0.7, alternates: contentAlt("blog") });
    for (const p of getPosts(lang)) {
      const other = translatedPost(lang, p.slug);
      const languages: Record<string, string> = { [htmlLang[lang]]: abs(localePath(lang, "blog", p.slug)) };
      if (other) languages[htmlLang[other.lang]] = abs(localePath(other.lang, "blog", other.post.slug));
      const nlUrl = lang === "nl" ? languages[htmlLang.nl] : other?.lang === "nl" ? languages[htmlLang.nl] : undefined;
      if (nlUrl) languages["x-default"] = nlUrl;
      entries.push({ url: abs(localePath(lang, "blog", p.slug)), lastModified: new Date(p.updated ?? p.date), changeFrequency: "monthly", priority: 0.6, alternates: { languages } });
    }
  }
  return entries;
}
