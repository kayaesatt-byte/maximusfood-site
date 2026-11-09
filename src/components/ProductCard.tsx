"use client";

import Link from "next/link";
import ProductIcon from "@/components/ProductIcon";
import PriceTag from "@/components/PriceTag";
import ProductQty from "@/components/ProductQty";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { productImage } from "@/data/product-images";
import { productName, type Product } from "@/data/products";
import { packagingText, productPath } from "@/lib/product";
import { Plus } from "lucide-react";

/**
 * Amazon tarzı ürün kartı: büyük kare fotoğraf, ad, marka, ambalaj, fiyat ve sepete ekleme.
 * Fotoğrafı olmayan ürün kategori simgesiyle gösterilir (yapay zekâyla uydurulmuş fotoğraf yok).
 * Fotoğrafa ve ada tıklamak ürün sayfasını açar.
 */
export default function ProductCard({ p }: { p: Product }) {
  const { lang, t } = useI18n();
  const cart = useCart();
  const name = productName(p, lang);
  const src = productImage(p.id);
  const inCart = cart.lines.some((l) => l.productId === p.id);
  const href = productPath(lang, p);

  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${inCart ? "border-brand-500/60" : "border-cream-200"}`} data-testid="product-card">
      <Link href={href} className="relative block aspect-square bg-white" aria-label={t.product.viewProduct.replace("{name}", name)}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} loading="lazy" decoding="async" width={800} height={800} className="h-full w-full object-contain p-2" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-cream-50">
            <ProductIcon category={p.category} size="lg" />
          </span>
        )}
        {p.tags?.includes("çok satan") && (
          <span className="absolute start-2 top-2 rounded bg-gold-500/90 px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-900">{t.order.bestseller}</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={href} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink-900 hover:text-brand-600">
          {name}
        </Link>
        <p className="text-xs text-ink-500">
          {p.brand} · {packagingText(p, lang)}
        </p>
        <div className="mt-1 min-h-[2.25rem]">
          <PriceTag p={p} />
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          {inCart ? (
            <ProductQty p={p} compact />
          ) : (
            <button
              type="button"
              onClick={() => cart.setQuantity(p.id, 1, 0)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-600"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t.order.addToCart}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
