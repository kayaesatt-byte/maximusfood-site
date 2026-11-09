"use client";

import { useCart } from "@/components/CartProvider";
import QtyCounter from "@/components/QtyCounter";
import { useI18n } from "@/i18n/I18nProvider";
import { unitLabel, type Product } from "@/data/products";

/** Ürünün koli ve adet sayaçları; sepetle senkron. Sipariş listesi, kartlar ve ürün sayfası kullanır. */
export default function ProductQty({ p, compact = false }: { p: Product; compact?: boolean }) {
  const cart = useCart();
  const { lang, t } = useI18n();
  const line = cart.lines.find((l) => l.productId === p.id);
  return (
    <div className="flex items-end gap-3">
      <QtyCounter compact={compact} label={t.order.caseLabel} value={line?.cases ?? 0} onChange={(v) => cart.setQuantity(p.id, v, line?.units ?? 0)} />
      <QtyCounter compact={compact} label={unitLabel(p, lang)} value={line?.units ?? 0} onChange={(v) => cart.setQuantity(p.id, line?.cases ?? 0, v)} />
    </div>
  );
}
