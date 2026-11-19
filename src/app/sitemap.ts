import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { regions } from "@/data/regions";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { categoryPath, isIndexableProduct, productPath } from "@/lib/product";
import { getPosts, translatedPost } from "@/data/blog";
import { contentLocales, defaultLocale, htmlLang, localePath, locales, type Locale } from "@/i18n/config";
import { contentDates } from "@/data/content-dates";

/**
 * Site haritası.
 * Arayüz sayfaları (ana sayfa, sipariş, bölge dizini, gizlilik) ile ürün grubu, SSS ve "over ons" dört dilde listelenir.
 * Uzun içerik sayfaları (bölge detayları, blog yazıları) yalnızca yazıldıkları dillerde
 * (Hollandaca, Türkçe) listelenir; diğer dillerdeki karşılıkları noindex olduğu için haritaya girmez.
 * Ürün sayfaları yalnızca dizine açık ürünler için (isIndexableProduct: marka + ambalaj bilgisi), Hollandaca ve Türkçe listelenir.
 * lastmod: sayfa türünün içeriğinin gerçekten değiştiği gün (src/data/content-dates.ts); blogda yazının tarihi.
 * Kategori süzgeçleri (?categorie=) haritada yok: canonical'ları sipariş sayfasının kendisidir.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const d = (k: keyof typeof contentDates) => new Date(`${contentDates[k]}T00:00:00Z`);
  const abs = (p: string) => `${site.url}${p === "/" ? "" : p}`;
  const entries: MetadataRoute.Sitemap = [];
  const altOf = (list: readonly Locale[]) => (route?: Parameters<typeof localePath>[1], rest?: string, q?: string) => ({
    languages: { ...Object.fromEntries(list.map((l) => [htmlLang[l], abs(localePath(l, route, rest, q))])), "x-default": abs(localePath(defaultLocale, route, rest, q)) },
  });
  const uiAlt = altOf(locales);
  const contentAlt = altOf(contentLocales);

  for (const lang of locales) {
    const home = lang === "nl" ? 1 : 0.8;
    entries.push({ url: abs(localePath(lang)), lastModified: d("home"), changeFrequency: "weekly", priority: home, alternates: uiAlt() });
    entries.push({ url: abs(localePath(lang, "order")), lastModified: d("order"), changeFrequency: "weekly", priority: 0.9, alternates: uiAlt("order") });
    entries.push({ url: abs(localePath(lang, "regions")), lastModified: d("regionsIndex"), changeFrequency: "monthly", priority: 0.8, alternates: uiAlt("regions") });
    entries.push({ url: abs(localePath(lang, "privacy")), lastModified: d("privacy"), changeFrequency: "yearly", priority: 0.2, alternates: uiAlt("privacy") });
    for (const c of categories) {
      entries.push({ url: abs(categoryPath(lang, c.slug)), lastModified: d("categories"), changeFrequency: "weekly", priority: lang === "nl" ? 0.8 : 0.7, alternates: uiAlt("assortment", c.slug) });
    }
    entries.push({ url: abs(localePath(lang, "faq")), lastModified: d("faq"), changeFrequency: "monthly", priority: 0.6, alternates: uiAlt("faq") });
    entries.push({ url: abs(localePath(lang, "about")), lastModified: d("about"), changeFrequency: "monthly", priority: 0.6, alternates: uiAlt("about") });
  }

  for (const lang of contentLocales) {
    for (const r of regions) {
      entries.push({ url: abs(localePath(lang, "regions", r.slug)), lastModified: d("regions"), changeFrequency: "monthly", priority: lang === "nl" ? 0.8 : 0.6, alternates: contentAlt("regions", r.slug) });
    }
    // Ürün sayfaları: yalnızca dizine açık olanlar haritaya girer (öteki sayfalar noindex; kural tek yerde, bkz. isIndexableProduct).
    for (const p of products.filter(isIndexableProduct)) {
      entries.push({ url: abs(productPath(lang, p)), lastModified: d("products"), changeFrequency: "monthly", priority: 0.5, alternates: contentAlt("product", p.id) });
    }
    const posts = getPosts(lang);
    const latest = posts.map((p) => p.updated ?? p.date).sort().at(-1);
    entries.push({ url: abs(localePath(lang, "blog")), lastModified: latest ? new Date(latest) : d("home"), changeFrequency: "weekly", priority: 0.7, alternates: contentAlt("blog") });
    for (const p of posts) {
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
