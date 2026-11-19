/**
 * Site haritasındaki <lastmod> değerleri: her sayfa türünün içeriğinin GERÇEKTEN değiştiği son gün.
 *
 * Neden sabit tarih: eskiden her derlemede `new Date()` yazılıyordu; 1.130 adresin hepsi aynı
 * tarihi gösteriyordu ve arama motorları bu yüzden lastmod'a güvenmiyordu (SEO denetimi 19.11.2026).
 *
 * Kural: bir sayfa türünün metnini, ürün listesini veya bölge verisini değiştirdiğinde
 * buradaki tarihi o günün tarihiyle güncelle. Yalnızca tasarım/kod değişikliğinde güncelleme.
 * Blog yazıları kendi `date` / `updated` alanlarını kullanır.
 */
export const contentDates = {
  home: "2026-09-14",
  order: "2026-11-13",
  regionsIndex: "2026-10-28",
  privacy: "2026-10-20",
  /** Bölge detay sayfaları (regions.ts, regionCustomers.ts) */
  regions: "2026-10-28",
  /** Ürün grubu sayfaları (fr/en metinleri 19.11.2026'da eklendi) */
  categories: "2026-11-19",
  /** Ürün sayfaları (products.ts) */
  products: "2026-11-13",
  faq: "2026-11-19",
  about: "2026-11-19",
} as const;

export type ContentDateKey = keyof typeof contentDates;
