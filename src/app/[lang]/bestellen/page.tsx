import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import QuickOrderMatrix from "@/components/QuickOrderMatrix";
import { getDictionary, isLocale, localePath, type Locale } from "@/i18n";
import { alternatesFor } from "@/lib/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const t = getDictionary(lang).order;
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternatesFor(lang, "order") };
}

export default async function OrderPage({ params }: { params: Params }) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "nl";
  const t = getDictionary(lang).order;
  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{t.eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink-900 sm:text-4xl">{t.title}</h1>
        <p className="mt-2 max-w-2xl text-ink-500">{t.text}</p>
        {/* Katalog sayfaları ürünleri sunucu tarafında listeler: arama motorları buradan ulaşır. */}
        <Link
          href={localePath(lang, "products")}
          className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-600"
        >
          {getDictionary(lang).catalog.allCategories}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      {/* Matris useSearchParams kullandığı için sunucuda yedek alan gösterilir ve liste
          hidrasyonda belirir. Yedek alan kısa kalırsa altbilgi görünür durumdayken aşağı
          itiliyor ve ölçülen CLS 0,277'ye çıkıyordu; ekran boyu yükseklik bunu sıfırlıyor. */}
      <Suspense fallback={<div className="flex min-h-[80vh] items-start justify-center py-20 text-ink-500">{t.loading}</div>}>
        <QuickOrderMatrix />
      </Suspense>
    </div>
  );
}
