import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, MessageCircle } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { categoryHref } from "@/components/CategoryGrid";
import { categories, getCategory } from "@/data/categories";
import { categoryName } from "@/data/categories.i18n";
import { productName } from "@/data/products";
import { contentLocale, fill, getDictionary, isLocale, localeNames, localePath, locales, type Locale } from "@/i18n";
import { site } from "@/lib/site";
import { alternatesFor, jsonLd, robotsFor } from "@/lib/seo";
import { brandsIn, categoryPath, productPath, productsIn } from "@/lib/product";

/**
 * Ürün grubu sayfası (/assortiment/sauzen, /tr/urun-gruplari/sauzen).
 * Metin yalnızca gerçek verilerden kurulur: grup adı, ürün sayısı, markalar. nl/tr dizine girer;
 * fr/en açılır ama noindex + canonical nl (ürün adları yalnızca nl/tr yazılıdır).
 */
type Params = Promise<{ lang: string; slug: string }>;

/** Girişte ve meta açıklamada anılan en çok marka sayısı. */
const BRANDS_IN_TEXT = 5;

export function generateStaticParams() {
  return locales.flatMap((lang) => categories.map((c) => ({ lang, slug: c.slug })));
}

function vars(lang: Locale, slug: string) {
  const c = getCategory(slug)!;
  return { category: categoryName(c, lang), n: productsIn(slug).length, brands: brandsIn(slug).slice(0, BRANDS_IN_TEXT).join(", ") };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const c = getCategory(slug);
  if (!c) return { title: "404" };
  const t = getDictionary(lang).categoryPage;
  const v = vars(lang, slug);
  const title = fill(t.metaTitle, v);
  const description = fill(t.metaDescription, v);
  return {
    title: { absolute: title },
    description,
    alternates: alternatesFor(lang, "assortment", c.slug, undefined, "content"),
    robots: robotsFor(lang, "content"),
    openGraph: { siteName: site.name, title, description, type: "website", images: [{ url: c.image }] },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { lang: raw, slug } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const c = getCategory(slug);
  if (!c) notFound();
  const dict = getDictionary(lang);
  const t = dict.categoryPage;
  const v = vars(lang, slug);
  const items = productsIn(slug);
  const brands = brandsIn(slug);
  const pageUrl = `${site.url}${categoryPath(lang, c.slug)}`;

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#page`,
        name: fill(t.title, v),
        description: fill(t.intro, v),
        url: pageUrl,
        isPartOf: { "@id": `${site.url}/#organization` },
        mainEntity: { "@id": `${pageUrl}#list` },
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#list`,
        name: fill(t.productsTitle, v),
        numberOfItems: items.length,
        itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: productName(p, lang), url: `${site.url}${productPath(lang, p)}` })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: dict.product.home, item: `${site.url}${localePath(lang)}` },
          { "@type": "ListItem", position: 2, name: dict.nav.products, item: `${site.url}${localePath(lang, "order")}` },
          { "@type": "ListItem", position: 3, name: v.category, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <article className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-ink-500">
        <Link href={localePath(lang)} className="hover:text-brand-600">{dict.product.home}</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href={localePath(lang, "order")} className="hover:text-brand-600">{dict.nav.products}</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-ink-900">{v.category}</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{t.eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink-900 sm:text-4xl">{fill(t.title, v)}</h1>
        {contentLocale[lang] !== lang && (
          <p className="mt-4 rounded-xl border border-cream-200 bg-cream-100 px-4 py-3 text-sm text-ink-700" data-testid="content-lang-notice">
            {fill(dict.common.contentLangNotice, { lang: localeNames[contentLocale[lang]] })}
          </p>
        )}
        <p className="mt-4 leading-relaxed text-ink-700" data-testid="category-intro">{fill(t.intro, v)}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={categoryHref(lang, c.slug)} className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
            {t.orderCta} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-wa px-5 py-2.5 text-sm font-bold text-white hover:bg-wa-dark">
            <MessageCircle className="h-4 w-4" aria-hidden /> {t.whatsappCta}
          </a>
        </div>
      </header>

      {brands.length > 0 && (
        <section className="mt-8" aria-label={t.brands}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">{t.brands}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {brands.map((b) => (
              <li key={b} className="rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-ink-700">{b}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10" aria-label={fill(t.productsTitle, v)}>
        <h2 className="font-display text-2xl font-bold text-ink-900">{fill(t.productsTitle, v)}</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {items.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <nav className="mt-14" aria-label={t.otherGroups}>
        <h2 className="font-display text-xl font-bold text-ink-900">{t.otherGroups}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {categories.filter((o) => o.slug !== c.slug).map((o) => (
            <li key={o.slug}>
              <Link href={categoryPath(lang, o.slug)} className="rounded-full bg-cream-100 px-3 py-1.5 text-sm font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-600">{categoryName(o, lang)}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
