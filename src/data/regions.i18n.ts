/**
 * Bölge sayfası metinlerinin dillere göre kaynağı.
 *
 * Hollandaca ve Türkçe metin regions.ts içinde kaynaktır. Fransızca çeviri regions.fr.json'da durur
 * (19.11.2026). İngilizce henüz yok: /en/regions/... sayfaları Hollandaca metni gösterir, noindex kalır.
 * Bir dile çeviri eklendiğinde: JSON dosyasını ekle, `overlays`a ve `regionLocales`a o dili yaz.
 */
import type { Locale } from "@/i18n/config";
import type { Region } from "./regions.types";
import fr from "./regions.fr.json";

type RegionText = Region["nl"];

const overlays: Partial<Record<Locale, Record<string, RegionText>>> = {
  fr: fr as Record<string, RegionText>,
};

/** Bölge metninin gerçekten yazılı olduğu diller: bu dillerdeki bölge sayfaları dizine girer. */
export const regionLocales = ["nl", "fr", "tr"] as const satisfies readonly Locale[];

/** Sayfada gösterilecek metin ve metnin dili (çeviri yoksa Hollandaca). */
export function regionText(r: Region, lang: Locale): { text: RegionText; lang: Locale } {
  if (lang === "tr") return { text: r.tr, lang: "tr" };
  const o = overlays[lang]?.[r.slug];
  if (o) return { text: o, lang };
  return { text: r.nl, lang: "nl" };
}
