import { partners } from "@/lib/site";
import { getDictionary, type Locale } from "@/i18n";

export default function Partners({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).partners;
  return (
    <section className="border-y border-cream-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{t.eyebrow}</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
              {t.title}
            </h2>
          </div>
          <p className="max-w-md text-sm text-ink-500">
            {t.text}
          </p>
        </div>

        {/* Merk logo's worden bewust niet getoond (geen toestemming van de merkhouders); alleen de namen. */}
        <ul className="mt-8 flex flex-wrap gap-2">
          {partners.map((p) => (
            <li key={p.name} className="rounded-full border border-cream-200 bg-cream-50 px-4 py-2 text-sm font-semibold text-ink-800">
              {p.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
