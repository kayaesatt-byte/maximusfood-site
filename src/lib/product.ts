import { products, productName, type Product } from "@/data/products";
import { productImage } from "@/data/product-images";
import { contentLocale, localePath, type Locale } from "@/i18n/config";

/** Ürün sayfasının yolu: localePath("tr", ürün) → "/tr/urun/fd-szn-031". Adres ürün kimliğidir (kimlikler URL için güvenlidir). */
export function productPath(lang: Locale, p: Pick<Product, "id">): string {
  return localePath(lang, "product", p.id);
}

/** Dile göre ambalaj yazısı: "1 x 2,5 kg", "6 x 1 L", "100 stuks" / "100 adet". */
export function packagingText(p: Product, lang: Locale): string {
  if (p.unitSize === "Adet") {
    const word = contentLocale[lang] === "nl" ? "stuks" : "adet";
    return p.unitsPerCase === 1 ? `1 ${word}` : `${p.unitsPerCase} ${word}`;
  }
  return p.unitsPerCase === 1 ? `1 x ${p.unitSize}` : `${p.unitsPerCase} x ${p.unitSize}`;
}

/** Fotoğrafı olan ürünler (kartta ve sayfada fotoğraf gösterilir). */
export const hasPhoto = (p: Pick<Product, "id">): boolean => Boolean(productImage(p.id));

/** Ambalaj bilgisi var mı: ölçülü birim ("2,5 kg", "33 cl") ya da kolide birden çok birim. Yalnızca "1 adet" bilgi sayılmaz. */
export function hasPackaging(p: Pick<Product, "unitSize" | "unitsPerCase">): boolean {
  const size = p.unitSize.trim();
  return (size !== "" && size !== "Adet") || p.unitsPerCase > 1;
}

/**
 * Ürün sayfası dizine girer mi (yalnızca içerik dillerinde, nl/tr; fr/en her zaman noindex + canonical nl).
 * Kural (13.11.2026): markası ve ambalaj bilgisi olan ürün, fotoğrafı olsun olmasın dizine girer.
 * Daha önce dizinde olan fotoğraflı ürünler dizinde kalır. Sayfa meta etiketi ve site haritası bu tek kuralı kullanır.
 */
export function isIndexableProduct(p: Pick<Product, "id" | "brand" | "unitSize" | "unitsPerCase">): boolean {
  return hasPhoto(p) || (p.brand.trim() !== "" && hasPackaging(p));
}

/** Ürün grubu sayfasının yolu: categoryPath("tr", "sauzen") → "/tr/urun-gruplari/sauzen". */
export function categoryPath(lang: Locale, slug: string): string {
  return localePath(lang, "assortment", slug);
}

/** Bir ürün grubundaki ürünler, katalog sırasıyla. */
export function productsIn(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

/** Bir ürün grubundaki markalar, en çok ürünü olandan başlayarak (eşitlikte alfabetik). */
export function brandsIn(category: string): string[] {
  const count = new Map<string, number>();
  for (const p of productsIn(category)) if (p.brand.trim()) count.set(p.brand, (count.get(p.brand) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([b]) => b);
}

/** Aynı gruptan benzer ürünler: önce aynı marka, sonra fotoğrafı olanlar; ürünün kendisi hariç, en çok `limit` adet. */
export function similarProducts(p: Product, limit = 8): Product[] {
  const pool = products.filter((q) => q.category === p.category && q.id !== p.id);
  const score = (q: Product) => (q.brand === p.brand ? 2 : 0) + (hasPhoto(q) ? 1 : 0);
  return pool
    .map((q, i) => ({ q, i }))
    .sort((a, b) => score(b.q) - score(a.q) || a.i - b.i)
    .slice(0, limit)
    .map(({ q }) => q);
}

/** Ürün adı (arayüz diline göre) — kartlar ve sayfa aynı adı kullansın. */
export const displayName = (p: Product, lang: Locale): string => productName(p, lang);
