import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { faqFor } from "@/data/info-pages";
import { contentLocale, fill, getDictionary, htmlLang, isLocale, localeNames, localePath, type Locale } from "@/i18n";
import { site } from "@/lib/site";
import { alternatesFor, jsonLd, robotsFor } from "@/lib/seo";

/** Sık sorulan sorular: metin nl/tr (src/data/info-pages.ts); fr/en Hollandaca metni gösterir, noindex + canonical nl. */
type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const t = getDictionary(lang).faqPage;
  return {
    title: { absolute: t.metaTitle },
    description: t.metaDescription,
    alternates: alternatesFor(lang, "faq", undefined, undefined, "content"),
    robots: robotsFor(lang, "content"),
  };
}

export default async function FaqPage({ params }: { params: Params }) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const dict = getDictionary(lang);
  const t = dict.faqPage;
  const faq = faqFor(contentLocale[lang]);
  const pageUrl = `${site.url}${localePath(lang, "faq")}`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        url: pageUrl,
        inLanguage: htmlLang[contentLocale[lang]],
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
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
      <div className="mt-8 divide-y divide-cream-200 rounded-2xl border border-cream-200 bg-white" lang={htmlLang[contentLocale[lang]]}>
        {faq.map((f) => (
          <section key={f.q} className="p-5">
            <h2 className="font-semibold text-ink-900">{f.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">{f.a}</p>
          </section>
        ))}
      </div>
      <p className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
        <Link href={localePath(lang, "order")} className="text-brand-600 hover:underline">{dict.nav.products} →</Link>
        <Link href={localePath(lang, "about")} className="text-brand-600 hover:underline">{dict.footer.aboutLink} →</Link>
      </p>
    </div>
  );
}
