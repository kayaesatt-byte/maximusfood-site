import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package } from "lucide-react";
import { categories } from "@/data/categories";
import { categoryName, categoryDescription } from "@/data/categories.i18n";
import { brandsOf, productCount } from "@/data/catalog";
import { products } from "@/data/products";
import { site } from "@/lib/site";
import { fill, getDictionary, isLocale, localePath, locales, type Locale } from "@/i18n";
import { alternatesFor, jsonLd } from "@/lib/seo";

type Params = Promise<{ lang: string }>;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const t = getDictionary(lang).catalog;
  const description = fill(t.metaDescription, { count: products.length });
  return {
    title: t.metaTitle,
    description,
    alternates: alternatesFor(lang, "products"),
    openGraph: { siteName: site.name, title: t.metaTitle, description, type: "website", images: [{ url: "/media/hero/hero-warehouse.jpg" }] },
  };
}

export default async function CatalogIndex({ params }: { params: Params }) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const t = getDictionary(lang).catalog;
  const nav = getDictionary(lang).nav;
  const pageUrl = `${site.url}${localePath(lang, "products")}`;

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#page`,
        name: t.title,
        description: fill(t.metaDescription, { count: products.length }),
        isPartOf: { "@id": `${site.url}/#organization` },
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#list`,
        numberOfItems: categories.length,
        itemListElement: categories.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: categoryName(c, lang),
          url: `${site.url}${localePath(lang, "products", c.slug)}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.breadcrumbHome, item: `${site.url}${localePath(lang)}` },
          { "@type": "ListItem", position: 2, name: nav.products, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />

      <nav aria-label="breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <Link href={localePath(lang)} className="hover:text-brand-500">{t.breadcrumbHome}</Link>
        <span aria-hidden>/</span>
        <span className="text-ink-900">{nav.products}</span>
      </nav>

      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{t.eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink-900 sm:text-4xl">{t.title}</h1>
        <p className="mt-3 text-ink-500">{fill(t.text, { count: products.length })}</p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const count = productCount(c.slug);
          const brands = brandsOf(c.slug).slice(0, 4);
          return (
            <Link
              key={c.slug}
              href={localePath(lang, "products", c.slug)}
              className="group flex min-h-[44px] flex-col overflow-hidden rounded-2xl border border-cream-200 bg-white transition hover:border-brand-300 hover:shadow-lg"
            >
              <div className="relative h-36 w-full overflow-hidden bg-cream-100">
                <Image
                  src={c.image}
                  alt={categoryName(c, lang)}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-lg font-bold text-ink-900">{categoryName(c, lang)}</h2>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-xs font-semibold text-ink-500">
                    <Package className="h-3.5 w-3.5" aria-hidden />
                    {count}
                  </span>
                </div>
                <p className="line-clamp-3 text-sm text-ink-500">{categoryDescription(c, lang)}</p>
                {brands.length > 0 && (
                  <p className="mt-auto pt-2 text-xs text-ink-400">{brands.join(" · ")}</p>
                )}
                <span className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-brand-500">
                  {fill(t.viewCategory, { category: categoryName(c, lang) })}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
