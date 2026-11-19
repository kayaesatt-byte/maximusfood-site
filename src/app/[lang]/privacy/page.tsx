import type { Metadata } from "next";
import { getDictionary, isLocale, localePath, type Locale } from "@/i18n";
import { site } from "@/lib/site";
import { alternatesFor, robotsFor, socialFor } from "@/lib/seo";
import { legalLine } from "@/components/Footer";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const t = getDictionary(lang).privacy;
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternatesFor(lang, "privacy"), robots: robotsFor(lang), ...socialFor({ lang, url: localePath(lang, "privacy"), title: `${t.metaTitle} | ${site.name}`, description: t.metaDescription }) };
}

export default async function PrivacyPage({ params }: { params: Params }) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const t = getDictionary(lang).privacy;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
      <h1 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">{t.title}</h1>
      <p className="mt-2 text-sm text-ink-500">{t.updated}</p>
      <div className="mt-8 space-y-7">
        {t.sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl font-bold text-ink-900">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-ink-500">{legalLine(s.p)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
