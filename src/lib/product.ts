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

/** Fotoğrafı olan ürünler: yalnızca bunların sayfaları site haritasına girer ve dizine açılır (fotoğrafsız sayfa ince içerik sayılır). */
export const hasPhoto = (p: Pick<Product, "id">): boolean => Boolean(productImage(p.id));

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
