import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageCircle, Package, ShoppingCart } from "lucide-react";
import { categories } from "@/data/categories";
import { categoryName, categoryDescription } from "@/data/categories.i18n";
import { brandsOf, getCategory, packaging, productName, productSlug, productsOf } from "@/data/catalog";
import { categoryHref } from "@/components/CategoryGrid";
import { site } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { contentLocale, fill, getDictionary, isContentLocale, isLocale, localeNames, localePath, locales, type Locale } from "@/i18n";
import { alternatesFor, jsonLd, robotsFor } from "@/lib/seo";

type Params = Promise<{ lang: string; category: string }>;

export function generateStaticParams() {
  return locales.flatMap((lang) => categories.map((c) => ({ lang, category: c.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: raw, category: slug } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const category = getCategory(slug);
  if (!category) return { title: "404" };
  const t = getDictionary(lang).catalog;
  const name = categoryName(category, lang);
  const items = productsOf(slug, lang);
  const brands = brandsOf(slug).slice(0, 3).join(", ");
  const title = fill(t.categoryMetaTitle, { category: name, count: items.length });
  const description = fill(t.categoryMetaDescription, { category: name, count: items.length, brands });
  return {
    title: { absolute: `${title} | ${site.name}` },
    description,
    // Uzun metinler yalnızca Hollandaca ve Türkçe yazıldı; diğer diller canonical ile asıl dile bakar.
    alternates: alternatesFor(lang, "products", slug, undefined, "content"),
    robots: robotsFor(lang, "content"),
    openGraph: { siteName: site.name, title, description, type: "website", images: [{ url: category.image }] },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { lang: raw, category: slug } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const category = getCategory(slug);
  if (!category) notFound();

  const t = getDictionary(lang).catalog;
  const nav = getDictionary(lang).nav;
  const common = getDictionary(lang).common;
  const items = productsOf(slug, lang);
  const brands = brandsOf(slug);
  const name = categoryName(category, lang);
  const pageUrl = `${site.url}${localePath(lang, "products", slug)}`;

  const faq = [
    { q: fill(t.faqQ1, { category: name }), a: t.faqA1 },
    { q: fill(t.faqQ2, { category: name }), a: t.faqA2 },
    { q: fill(t.faqQ3, { category: name }), a: t.faqA3 },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#page`,
        name,
        description: categoryDescription(category, lang),
        isPartOf: { "@id": `${site.url}/#organization` },
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#list`,
        numberOfItems: items.length,
        itemListElement: items.slice(0, 100).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: productName(p, lang),
          url: `${site.url}${localePath(lang, "products", `${slug}/${productSlug(p)}`)}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.breadcrumbHome, item: `${site.url}${localePath(lang)}` },
          { "@type": "ListItem", position: 2, name: nav.products, item: `${site.url}${localePath(lang, "products")}` },
          { "@type": "ListItem", position: 3, name, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />

      <nav aria-label="breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <Link href={localePath(lang)} className="py-1 hover:text-brand-500">{t.breadcrumbHome}</Link>
        <span aria-hidden>/</span>
        <Link href={localePath(lang, "products")} className="py-1 hover:text-brand-500">{nav.products}</Link>
        <span aria-hidden>/</span>
        <span className="py-1 text-ink-900">{name}</span>
      </nav>

      {!isContentLocale(lang) && (
        <p className="mb-6 rounded-xl bg-cream-100 px-4 py-3 text-sm text-ink-500">{fill(common.contentLangNotice, { lang: localeNames[contentLocale[lang]] })}</p>
      )}

      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{nav.products}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink-900 sm:text-4xl">{name}</h1>
        <p className="mt-3 text-ink-500">{categoryDescription(category, lang)}</p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-1.5 text-sm font-semibold text-ink-700">
          <Package className="h-4 w-4 text-brand-500" aria-hidden />
          {fill(t.inCategory, { count: items.length, category: name })}
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={categoryHref(lang, slug)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-600"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden />
          {t.orderCta}
        </Link>
        <a
          href={whatsappUrl(fill(t.categoryMetaTitle, { category: name, count: items.length }))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-cream-300 bg-white px-5 py-3 text-sm font-bold text-ink-900 transition hover:border-wa hover:text-wa-dark"
        >
          <MessageCircle className="h-4 w-4 text-wa" aria-hidden />
          {t.whatsappCta}
        </a>
      </div>

      {brands.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold text-ink-900">{t.brandsLabel}</h2>
          <p className="mt-2 text-sm text-ink-500">{brands.join(" · ")}</p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="sr-only">{name}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                href={localePath(lang, "products", `${slug}/${productSlug(p)}`)}
                className="flex min-h-[72px] flex-col justify-center gap-1 rounded-xl border border-cream-200 bg-white px-4 py-3 transition hover:border-brand-300 hover:shadow-md"
              >
                <span className="font-semibold text-ink-900">{productName(p, lang)}</span>
                <span className="text-sm text-ink-500">
                  {p.brand ? `${p.brand} · ` : ""}
                  {packaging(p, lang)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 max-w-3xl">
        <h2 className="font-display text-xl font-bold text-ink-900">{t.faqTitle}</h2>
        <dl className="mt-4 space-y-4">
          {faq.map((f) => (
            <div key={f.q} className="rounded-xl border border-cream-200 bg-white p-4">
              <dt className="font-semibold text-ink-900">{f.q}</dt>
              <dd className="mt-1 text-sm text-ink-500">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-ink-900">{t.allCategories}</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {categories
            .filter((c) => c.slug !== slug)
            .map((c) => (
              <li key={c.slug}>
                <Link
                  href={localePath(lang, "products", c.slug)}
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-cream-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-500"
                >
                  {categoryName(c, lang)}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}

export const dynamicParams = false;
