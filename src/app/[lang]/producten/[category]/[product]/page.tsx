import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MessageCircle, ShoppingCart, Truck, Warehouse } from "lucide-react";
import { categoryName } from "@/data/categories.i18n";
import { getCategory, getProduct, packaging, productName, productSlug, relatedProducts, unitLabel } from "@/data/catalog";
import { productImage } from "@/data/product-images";
import { products } from "@/data/products";
import { categoryHref } from "@/components/CategoryGrid";
import { site } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { contentLocale, fill, getDictionary, isContentLocale, isLocale, localeNames, localePath, type Locale } from "@/i18n";
import { alternatesFor, jsonLd, robotsFor } from "@/lib/seo";

type Params = Promise<{ lang: string; category: string; product: string }>;

export function generateStaticParams() {
  // Katalog yazılı olan iki dilde önceden üretilir; Fransızca ve İngilizce karşılıkları
  // istek anında üretilir ve zaten noindex + canonical ile Hollandacaya bakar.
  const written: Locale[] = ["nl", "tr"];
  return written.flatMap((lang) =>
    products.map((p) => ({ lang, category: p.category, product: productSlug(p) })),
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: raw, category, product: slug } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const p = getProduct(slug);
  if (!p || p.category !== category) return { title: "404" };
  const t = getDictionary(lang).catalog;
  const name = productName(p, lang);
  const title = fill(t.productMetaTitle, { product: name, brand: p.brand || site.name });
  const description = fill(t.productMetaDescription, { product: name, brand: p.brand || site.name, packaging: packaging(p, lang) });
  const image = productImage(p.id);
  return {
    title: { absolute: `${title} | ${site.name}` },
    description,
    alternates: alternatesFor(lang, "products", `${category}/${slug}`, undefined, "content"),
    robots: robotsFor(lang, "content"),
    openGraph: {
      siteName: site.name,
      title,
      description,
      type: "website",
      images: [{ url: image ?? "/media/hero/hero-warehouse.jpg" }],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { lang: raw, category, product: slug } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const p = getProduct(slug);
  if (!p || p.category !== category) notFound();
  const cat = getCategory(category);
  if (!cat) notFound();

  const t = getDictionary(lang).catalog;
  const nav = getDictionary(lang).nav;
  const common = getDictionary(lang).common;
  const hero = getDictionary(lang).hero;
  const name = productName(p, lang);
  const catName = categoryName(cat, lang);
  const image = productImage(p.id);
  const pageUrl = `${site.url}${localePath(lang, "products", `${category}/${slug}`)}`;

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${pageUrl}#product`,
        name,
        // Katalog adı ambalaj bilgisini de taşır; arayan kişi tam formatı görebilsin.
        alternateName: p.nameNl,
        sku: p.sku !== "—" ? p.sku : undefined,
        brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
        category: catName,
        image: image ? `${site.url}${image}` : undefined,
        description: fill(t.productMetaDescription, { product: name, brand: p.brand || site.name, packaging: packaging(p, lang) }),
        url: pageUrl,
        offers: {
          // Fiyat yalnızca onaylı müşterilere gösterilir; teklif bu yüzden fiyatsız
          // ama satıcı, para birimi ve iletişim kanalıyla birlikte tanımlanır.
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          priceCurrency: "EUR",
          seller: { "@id": `${site.url}/#organization` },
          url: pageUrl,
          areaServed: [{ "@type": "Country", name: "Belgium" }, { "@type": "Country", name: "Netherlands" }],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.breadcrumbHome, item: `${site.url}${localePath(lang)}` },
          { "@type": "ListItem", position: 2, name: nav.products, item: `${site.url}${localePath(lang, "products")}` },
          { "@type": "ListItem", position: 3, name: catName, item: `${site.url}${localePath(lang, "products", category)}` },
          { "@type": "ListItem", position: 4, name, item: pageUrl },
        ],
      },
    ],
  };

  const specs: { label: string; value: string }[] = [
    { label: t.brandLabel, value: p.brand || "—" },
    { label: t.packagingLabel, value: packaging(p, lang) },
    { label: t.unitLabel, value: unitLabel(p, lang) },
    { label: t.articleNumber, value: p.sku },
    { label: t.categoryLabel, value: catName },
  ];

  const related = relatedProducts(p, lang);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />

      <nav aria-label="breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <Link href={localePath(lang)} className="py-1 hover:text-brand-500">{t.breadcrumbHome}</Link>
        <span aria-hidden>/</span>
        <Link href={localePath(lang, "products")} className="py-1 hover:text-brand-500">{nav.products}</Link>
        <span aria-hidden>/</span>
        <Link href={localePath(lang, "products", category)} className="py-1 hover:text-brand-500">{catName}</Link>
        <span aria-hidden>/</span>
        <span className="py-1 text-ink-900">{name}</span>
      </nav>

      {!isContentLocale(lang) && (
        <p className="mb-6 rounded-xl bg-cream-100 px-4 py-3 text-sm text-ink-500">{fill(common.contentLangNotice, { lang: localeNames[contentLocale[lang]] })}</p>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-cream-200 bg-white">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-contain p-6"
              priority
            />
          ) : (
            <Image
              src={cat.image}
              alt={catName}
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-cover opacity-70"
            />
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{p.brand || catName}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink-900">{name}</h1>
          <p className="mt-2 text-ink-500">{p.nameNl}</p>

          <dl className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {specs.map((s) => (
              <div key={s.label} className="border-b border-cream-200 pb-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">{s.label}</dt>
                <dd className="text-ink-900">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 rounded-2xl bg-cream-100 p-5">
            <h2 className="font-display text-lg font-bold text-ink-900">{t.priceTitle}</h2>
            <p className="mt-1 text-sm text-ink-500">{t.priceText}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={categoryHref(lang, category)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-600"
              >
                <ShoppingCart className="h-4 w-4" aria-hidden />
                {t.orderCta}
              </Link>
              <a
                href={whatsappUrl(`${name}${p.sku !== "—" ? ` (${p.sku})` : ""}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-cream-300 bg-white px-5 py-3 text-sm font-bold text-ink-900 transition hover:border-wa hover:text-wa-dark"
              >
                <MessageCircle className="h-4 w-4 text-wa" aria-hidden />
                {t.whatsappCta}
              </a>
            </div>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            <li className="flex items-start gap-2 text-sm text-ink-500">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
              {hero.usp3}
            </li>
            <li className="flex items-start gap-2 text-sm text-ink-500">
              <Warehouse className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
              {hero.usp1}
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-bold text-ink-900">{t.relatedTitle}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={localePath(lang, "products", `${r.category}/${productSlug(r)}`)}
                  className="flex min-h-[72px] flex-col justify-center gap-1 rounded-xl border border-cream-200 bg-white px-4 py-3 transition hover:border-brand-300 hover:shadow-md"
                >
                  <span className="font-semibold text-ink-900">{productName(r, lang)}</span>
                  <span className="text-sm text-ink-500">{packaging(r, lang)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
