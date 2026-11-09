import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageCircle } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductIcon from "@/components/ProductIcon";
import ProductQty from "@/components/ProductQty";
import PriceTag from "@/components/PriceTag";
import { categoryHref } from "@/components/CategoryGrid";
import { products, getProduct, productName, unitLabel } from "@/data/products";
import { productImage } from "@/data/product-images";
import { getCategory } from "@/data/categories";
import { categoryName } from "@/data/categories.i18n";
import { contentLocale, fill, getDictionary, isLocale, localePath, locales, type Locale } from "@/i18n";
import { site } from "@/lib/site";
import { alternatesFor, jsonLd, robotsFor } from "@/lib/seo";
import { hasPhoto, packagingText, productPath, similarProducts } from "@/lib/product";
import { whatsappUrl } from "@/lib/whatsapp";

type Params = Promise<{ lang: string; id: string }>;

export function generateStaticParams() {
  return locales.flatMap((lang) => products.map((p) => ({ lang, id: p.id })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: raw, id } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const p = getProduct(id);
  if (!p) return { title: "404" };
  const t = getDictionary(lang).product;
  const name = productName(p, lang);
  const vars = { name, packaging: packagingText(p, lang) };
  const title = fill(t.metaTitle, vars);
  const description = fill(t.metaDescription, vars);
  const image = productImage(p.id);
  // Fotoğrafsız ürün sayfası ince içerik sayılır: açılır ama arama motoruna verilmez. Fotoğraf eklenince kendiliğinden dizine girer.
  const robots = hasPhoto(p) ? robotsFor(lang, "content") : { index: false, follow: true };
  return {
    title: { absolute: title },
    description,
    alternates: alternatesFor(lang, "product", p.id, undefined, "content"),
    robots,
    openGraph: { siteName: site.name, title, description, type: "website", images: [{ url: image ?? "/media/hero/hero-warehouse.jpg" }] },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { lang: raw, id } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const p = getProduct(id);
  if (!p) notFound();

  const dict = getDictionary(lang);
  const t = dict.product;
  const name = productName(p, lang);
  const category = getCategory(p.category);
  const catName = category ? categoryName(category, lang) : "";
  const src = productImage(p.id);
  const pageUrl = `${site.url}${productPath(lang, p)}`;
  const similar = similarProducts(p, 8);
  const wa = whatsappUrl(fill(getDictionary(contentLocale[lang]).product.whatsappPrefill, { name: productName(p, contentLocale[lang]), sku: p.sku }));

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${pageUrl}#product`,
        name,
        ...(p.sku !== "—" ? { sku: p.sku } : {}),
        brand: { "@type": "Brand", name: p.brand },
        ...(catName ? { category: catName } : {}),
        description: fill(t.metaDescription, { name, packaging: packagingText(p, lang) }),
        ...(src ? { image: `${site.url}${src}` } : {}),
        url: pageUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.home, item: `${site.url}${localePath(lang)}` },
          { "@type": "ListItem", position: 2, name: dict.nav.products, item: `${site.url}${localePath(lang, "order")}` },
          ...(category ? [{ "@type": "ListItem", position: 3, name: catName, item: `${site.url}${categoryHref(lang, category.slug)}` }] : []),
          { "@type": "ListItem", position: category ? 4 : 3, name, item: pageUrl },
        ],
      },
    ],
  };

  const rows: Array<[string, string]> = [
    [t.brand, p.brand],
    ...(p.sku !== "—" ? ([[t.sku, p.sku]] as Array<[string, string]>) : []),
    ...(catName ? ([[t.category, catName]] as Array<[string, string]>) : []),
    [t.packaging, packagingText(p, lang)],
    [t.perCase, `${p.unitsPerCase} ${unitLabel(p, lang)}`],
  ];

  return (
    <article className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-ink-500">
        <Link href={localePath(lang)} className="hover:text-brand-600">{t.home}</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href={localePath(lang, "order")} className="hover:text-brand-600">{dict.nav.products}</Link>
        {category && (
          <>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <Link href={categoryHref(lang, category.slug)} className="hover:text-brand-600">{catName}</Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-ink-900">{name}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-cream-200 bg-white">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={name} width={800} height={800} fetchPriority="high" className="h-full w-full object-contain p-4" />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-3 bg-cream-50">
              <ProductIcon category={p.category} size="lg" />
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-300">{t.noPhoto}</span>
            </span>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{p.brand}</p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink-900 sm:text-4xl">{name}</h1>
          <p className="mt-2 text-sm text-ink-500">{packagingText(p, lang)}{p.sku !== "—" && <> · <span className="font-mono">{p.sku}</span></>}</p>

          <div className="mt-6 rounded-2xl border border-cream-200 bg-white p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">{t.orderHere}</h2>
            <div className="mt-3 min-h-[2.5rem]"><PriceTag p={p} /></div>
            <div className="mt-4"><ProductQty p={p} /></div>
            <a href={wa} target="_blank" rel="noopener noreferrer" data-testid="product-whatsapp" className="mt-5 inline-flex items-center gap-2 rounded-full bg-wa px-5 py-2.5 text-sm font-bold text-white transition hover:bg-wa-dark">
              <MessageCircle className="h-4 w-4" aria-hidden />
              {t.whatsappAsk}
            </a>
          </div>

          <h2 className="mt-8 text-xs font-bold uppercase tracking-wider text-ink-500">{t.details}</h2>
          <dl className="mt-3 divide-y divide-cream-200 rounded-2xl border border-cream-200 bg-white text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-ink-500">{k}</dt>
                <dd className="text-end font-semibold text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>
          <Link href={category ? categoryHref(lang, category.slug) : localePath(lang, "order")} className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:underline">
            ← {t.backToOrder}
          </Link>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-14" aria-label={fill(t.similar, { category: catName })}>
          <h2 className="font-display text-2xl font-bold text-ink-900">{fill(t.similar, { category: catName })}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {similar.map((q) => (
              <ProductCard key={q.id} p={q} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
