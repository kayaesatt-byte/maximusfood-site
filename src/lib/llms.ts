/**
 * /llms.txt ve /llms-full.txt metinleri (yapay zekâ asistanları için düz Markdown özeti).
 * Yalnızca doğrulanmış bilgiler: şirket, adres, nasıl sipariş verilir, ürün grupları ve ürünler (ad, marka, ambalaj).
 * FİYAT YOK, teslimat günü/ücreti yok, iddia yok. Bağlantılar Hollandaca (varsayılan dil) sayfalaradır.
 * Metin İngilizcedir: asistanların çoğu bu dosyayı İngilizce bekler; sayfalar nl/fr/en/tr.
 */
import { site } from "@/lib/site";
import { categories } from "@/data/categories";
import { categoryName } from "@/data/categories.i18n";
import { localePath } from "@/i18n/config";
import { absoluteUrl } from "@/lib/seo";
import { brandsIn, categoryPath, isIndexableProduct, packagingText, productPath, productsIn } from "@/lib/product";

const warehouse = `${site.address.street}, ${site.address.postal} ${site.address.city}, Belgium`;

function summary(): string[] {
  return [
    `# ${site.name}`,
    "",
    `> ${site.name} is a wholesaler (groothandel) for the horeca trade in Belgium: döner and kebab shops, pizzerias and snack bars. Warehouse: ${warehouse}. Legal entity: ${site.legal.name}, company number ${site.legal.companyNumber}.`,
    "",
    "## Key facts",
    "",
    `- Company: ${site.name}; legal entity ${site.legal.name}, company number (KBO) ${site.legal.companyNumber}.`,
    `- Warehouse address: ${warehouse}.`,
    "- Customers: businesses only (B2B), mainly döner/kebab shops, pizzerias and snack bars.",
    "- Delivery: to any area a customer asks for, in Belgium and the Netherlands.",
    "- Pickup: 15% discount when the order is collected at the warehouse in Aarschot.",
    `- How to order: WhatsApp ${site.phoneDisplay} (https://wa.me/${site.whatsapp}) or the order form on the website.`,
    "- Phone hours: Monday to Saturday, 09:00-15:30.",
    "- Prices: shown on the website after a business registers and the account is approved.",
    "- Website languages: Dutch (default), French, English, Turkish.",
    "- First Munzur Su dealer in Belgium.",
    "",
    "## Key pages (Dutch)",
    "",
    `- [Home](${absoluteUrl(localePath("nl"))})`,
    `- [Order form / products](${absoluteUrl(localePath("nl", "order"))})`,
    `- [About us](${absoluteUrl(localePath("nl", "about"))})`,
    `- [Frequently asked questions](${absoluteUrl(localePath("nl", "faq"))})`,
    `- [Delivery areas](${absoluteUrl(localePath("nl", "regions"))})`,
    `- [Blog](${absoluteUrl(localePath("nl", "blog"))})`,
    `- Turkish version: [Hakkımızda](${absoluteUrl(localePath("tr", "about"))}), [Sık sorulan sorular](${absoluteUrl(localePath("tr", "faq"))})`,
    "",
    "## Product groups",
    "",
    ...categories.map((c) => `- [${categoryName(c, "en")}](${absoluteUrl(categoryPath("nl", c.slug))}): ${productsIn(c.slug).length} products`),
  ];
}

/** Kısa özet: kim, ne, nerede, nasıl sipariş, önemli sayfalar. */
export function llmsText(): string {
  return [...summary(), "", `Full product list: ${absoluteUrl("/llms-full.txt")}`, ""].join("\n");
}

/** Özet + bütün ürün grupları ve ürünler (ad, marka, ambalaj); fiyat yok. */
export function llmsFullText(): string {
  const lines = [...summary(), "", "## Full product list", "", "Name | Brand | Packaging. No prices are published; prices are shown after registration.", ""];
  for (const c of categories) {
    const items = productsIn(c.slug);
    lines.push(`### ${categoryName(c, "en")} (${c.name.nl})`, "", `${items.length} products. Brands: ${brandsIn(c.slug).join(", ")}.`, "");
    for (const p of items) {
      const name = isIndexableProduct(p) ? `[${p.nameNlShort}](${absoluteUrl(productPath("nl", p))})` : p.nameNlShort;
      lines.push(`- ${name} | ${p.brand} | ${packagingText(p, "nl")}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
