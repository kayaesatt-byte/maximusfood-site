import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";
import { aboutFor } from "@/data/info-pages";
import { categories } from "@/data/categories";
import { categoryName } from "@/data/categories.i18n";
import { contentLocale, fill, getDictionary, htmlLang, isLocale, localeNames, localePath, type Locale } from "@/i18n";
import { site } from "@/lib/site";
import { alternatesFor, jsonLd, robotsFor } from "@/lib/seo";
import { categoryPath } from "@/lib/product";

/** "Over ons / Hakkımızda": metin nl/tr (src/data/info-pages.ts); fr/en Hollandaca metni gösterir, noindex + canonical nl. */
type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const t = getDictionary(lang).aboutPage;
  return {
    title: { absolute: t.metaTitle },
    description: t.metaDescription,
    alternates: alternatesFor(lang, "about", undefined, undefined, "content"),
    robots: robotsFor(lang, "content"),
  };
}

export default async function AboutPage({ params }: { params: Params }) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const dict = getDictionary(lang);
  const t = dict.aboutPage;
  const sections = aboutFor(contentLocale[lang]);
  const pageUrl = `${site.url}${localePath(lang, "about")}`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: t.title,
        inLanguage: htmlLang[contentLocale[lang]],
        about: { "@id": `${site.url}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: dict.product.home, item: `${site.url}${localePath(lang)}` },
          { "@type": "ListItem", position: 2, name: t.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-ink-500">
        <Link href={localePath(lang)} className="hover:text-brand-600">{dict.product.home}</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-ink-900">{t.title}</span>
      </nav>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{t.eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink-900 sm:text-4xl">{t.title}</h1>
      {contentLocale[lang] !== lang && (
        <p className="mt-4 rounded-xl border border-cream-200 bg-cream-100 px-4 py-3 text-sm text-ink-700" data-testid="content-lang-notice">
          {fill(dict.common.contentLangNotice, { lang: localeNames[contentLocale[lang]] })}
        </p>
      )}
      <div className="mt-8 space-y-7" lang={htmlLang[contentLocale[lang]]}>
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl font-bold text-ink-900">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-ink-700">{s.p}</p>
          </section>
        ))}
      </div>
      <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-wa px-5 py-2.5 text-sm font-bold text-white hover:bg-wa-dark">
        <MessageCircle className="h-4 w-4" aria-hidden /> {dict.whatsapp.orderButton}
      </a>
      <h2 className="mt-12 font-display text-xl font-bold text-ink-900">{t.moreTitle}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link href={categoryPath(lang, c.slug)} className="rounded-full bg-cream-100 px-3 py-1.5 text-sm font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-600">{categoryName(c, lang)}</Link>
          </li>
        ))}
        <li>
          <Link href={localePath(lang, "faq")} className="rounded-full bg-cream-100 px-3 py-1.5 text-sm font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-600">{dict.footer.faq}</Link>
        </li>
      </ul>
    </div>
  );
}
