import { contentLocale, type Locale } from "@/i18n/config";
import { products, type Product } from "./products";
import { categories, type Category } from "./categories";

/**
 * Katalog yardımcıları: ürün ve kategori sayfalarının ihtiyaç duyduğu slug üretimi,
 * arama ve dil seçimi.
 *
 * Ürünler `/producten/<kategori>/<urun-slug>` altında kendi sayfalarına sahiptir.
 * Daha önce bütün katalog tek bir istemci bileşeninde duruyordu; sunucu HTML'inde
 * tek bir ürün adı geçmediği için arama motorları 559 ürünün hiçbirini göremiyordu.
 */

/** URL'de kullanılabilir hale getirir: aksanları düşürür, boşlukları tire yapar. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[àáâãä]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[çć]/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ñ/g, "n")
    .replace(/ß/g, "ss")
    .replace(/&/g, " en ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Ürün slug'ı: okunabilir ad + katalog kimliği.
 * Kimlik şart, çünkü 559 üründe aynı ad 68 kez tekrar ediyor (aynı sosun farklı
 * ambalajları). Kimlik aynı zamanda ürün numarasıyla arayanı da doğru sayfaya getirir.
 */
export function productSlug(p: Product): string {
  return `${slugify(p.nameNlShort)}-${p.id}`;
}

const bySlug = new Map(products.map((p) => [productSlug(p), p]));

export function getProduct(slug: string): Product | undefined {
  return bySlug.get(slug);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

/** Bir kategorinin ürünleri, görüntülenecek dile göre alfabetik. */
export function productsOf(categorySlug: string, lang: Locale): Product[] {
  return products
    .filter((p) => p.category === categorySlug)
    .sort((a, b) => productName(a, lang).localeCompare(productName(b, lang), contentLocale[lang] === "tr" ? "tr" : "nl"));
}

/** Ürünün o dildeki görünen adı: Türkçe içerikte Türkçe ad, diğerlerinde Hollandaca. */
export function productName(p: Product, lang: Locale): string {
  return contentLocale[lang] === "tr" ? p.name : p.nameNlShort;
}

/**
 * Birim etiketleri katalogda yalnızca Türkçe yazılı; Hollandaca sayfada "Tüp" yerine
 * "tube" görünsün diye burada karşılıkları tutuluyor. Karşılığı olmayan etiket
 * (örn. "Bag-in-Box") olduğu gibi gösterilir.
 */
const UNIT_LABEL_NL: Record<string, string> = {
  Paket: "pak",
  Adet: "stuk",
  Şişe: "fles",
  Şiş: "fles",
  Kutu: "doos",
  Teneke: "blik",
  Bidon: "jerrycan",
  Kova: "emmer",
  Tüp: "tube",
  Rulo: "rol",
  Kavanoz: "bokaal",
};

/** Ürünün birim adı, görüntülenen dile göre. */
export function unitLabel(p: Product, lang: Locale): string {
  if (contentLocale[lang] === "tr") return p.unitLabel;
  return UNIT_LABEL_NL[p.unitLabel] ?? p.unitLabel;
}

/** Ambalaj özeti: "6 × 2,5 kg (doos)" gibi; fiyat göstermeden somut bilgi verir. */
export function packaging(p: Product, lang: Locale): string {
  const tr = contentLocale[lang] === "tr";
  if (p.unitsPerCase > 1) return `${p.unitsPerCase} × ${p.unitSize} (${tr ? "koli" : "doos"})`;
  return `${p.unitSize} (${unitLabel(p, lang)})`;
}

/** Aynı kategoriden, aynı markadan başlayarak seçilmiş benzer ürünler. */
export function relatedProducts(p: Product, lang: Locale, limit = 8): Product[] {
  const sameCategory = productsOf(p.category, lang).filter((x) => x.id !== p.id);
  const sameBrand = sameCategory.filter((x) => x.brand === p.brand);
  const rest = sameCategory.filter((x) => x.brand !== p.brand);
  return [...sameBrand, ...rest].slice(0, limit);
}

/** Kategorideki marka listesi (sayfada "hangi markalar var" sorusunu yanıtlar). */
export function brandsOf(categorySlug: string): string[] {
  const set = new Set(products.filter((p) => p.category === categorySlug).map((p) => p.brand).filter(Boolean));
  return [...set].sort((a, b) => a.localeCompare(b, "nl"));
}

export function productCount(categorySlug: string): number {
  return products.filter((p) => p.category === categorySlug).length;
}

/** Site haritası ve statik üretim için bütün (kategori, ürün) çiftleri. */
export function allProductParams(): { category: string; product: string }[] {
  return products.map((p) => ({ category: p.category, product: productSlug(p) }));
}
