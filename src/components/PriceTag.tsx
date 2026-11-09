"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { localePath } from "@/i18n/config";
import { formatEur } from "@/lib/format";
import type { Product } from "@/data/products";

/**
 * Ürün fiyatı: onaylı müşteriye fiyat, onay bekleyene "onaydan sonra", girişsiz ziyaretçiye giriş bağlantısı.
 * Sipariş listesi, kart görünümü ve ürün sayfası aynı kuralı kullanır.
 */
export default function PriceTag({ p, align = "start" }: { p: Pick<Product, "id">; align?: "start" | "end" }) {
  const { customer, prices } = useAuth();
  const { lang, t } = useI18n();
  const tt = t.order;
  const price = prices?.[p.id];
  if (customer && price !== undefined) {
    return (
      <div className={align === "end" ? "text-end" : undefined}>
        <span className="font-bold text-ink-900">{formatEur(price, lang)}</span>
        <span className="block text-xs text-ink-500">{tt.priceUnit}</span>
      </div>
    );
  }
  if (customer && customer.status !== "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/20 px-2.5 py-1 text-xs font-semibold text-yellow-800" title={t.auth.pendingTitle}>
        <Lock className="h-3 w-3" />
        {tt.pendingPrice}
      </span>
    );
  }
  if (customer) return <span className="text-xs text-ink-500">—</span>;
  return (
    <Link href={localePath(lang, "login")} className="inline-flex items-center gap-1.5 rounded-full border border-cream-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-brand-500 hover:text-brand-600">
      <Lock className="h-3.5 w-3.5" />
      {tt.loginForPrice}
    </Link>
  );
}
