import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { regions } from "@/data/regions";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { categoryPath, isIndexableProduct, productPath } from "@/lib/product";
import { getPosts, translatedPost } from "@/data/blog";
import { contentLocales, defaultLocale, htmlLang, localePath, locales, type Locale } from "@/i18n/config";

/**
 * Site haritası.
 * Arayüz sayfaları (ana sayfa, sipariş, bölge dizini) beş dilde listelenir.
 * Uzun içerik sayfaları (bölge detayları, blog yazıları) yalnızca yazıldıkları dillerde
 * (Hollandaca, Türkçe) listelenir; diğer dillerdeki karşılıkları noindex olduğu için haritaya girmez.
 * Ürün sayfaları yalnızca dizine açık ürünler için (isIndexableProduct: marka + ambalaj bilgisi), Hollandaca ve Türkçe listelenir.
 * Ürün grubu sayfaları, sık sorulan sorular ve "over ons" da Hollandaca ve Türkçe listelenir.
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
  }

  for (const lang of contentLocales) {
    for (const r of regions) {
      entries.push({ url: abs(localePath(lang, "regions", r.slug)), lastModified: now, changeFrequency: "monthly", priority: lang === "nl" ? 0.8 : 0.6, alternates: contentAlt("regions", r.slug) });
    }
    for (const c of categories) {
      entries.push({ url: abs(categoryPath(lang, c.slug)), lastModified: now, changeFrequency: "weekly", priority: lang === "nl" ? 0.8 : 0.7, alternates: contentAlt("assortment", c.slug) });
    }
    entries.push({ url: abs(localePath(lang, "faq")), lastModified: now, changeFrequency: "monthly", priority: 0.6, alternates: contentAlt("faq") });
    entries.push({ url: abs(localePath(lang, "about")), lastModified: now, changeFrequency: "monthly", priority: 0.6, alternates: contentAlt("about") });
    // Ürün sayfaları: yalnızca dizine açık olanlar haritaya girer (öteki sayfalar noindex; kural tek yerde, bkz. isIndexableProduct).
    for (const p of products.filter(isIndexableProduct)) {
      entries.push({ url: abs(productPath(lang, p)), lastModified: now, changeFrequency: "monthly", priority: 0.5, alternates: contentAlt("product", p.id) });
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
