/**
 * Sık sorulan sorular ve "Over ons / Hakkımızda" sayfalarının metni (yalnızca Hollandaca ve Türkçe;
 * Fransızca/İngilizce sayfalar Hollandaca metni gösterir, noindex + canonical nl).
 *
 * Kural: buraya yalnızca doğrulanmış bilgiler yazılır (13.11.2026 listesi). Fiyat, en az sipariş tutarı,
 * teslimat günü/saati/ücreti, müşteri sayısı, sertifika, "taze/en iyi/en ucuz" gibi iddialar YAZILMAZ.
 * Şirket adı, numarası ve adres src/lib/site.ts'ten okunur; ürün ve grup sayıları src/data'dan hesaplanır.
 */
import { site } from "@/lib/site";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import type { ContentLocale } from "@/i18n/config";

export type Faq = { q: string; a: string };
export type InfoSection = { h: string; p: string };

const warehouse = `${site.address.street}, ${site.address.postal} ${site.address.city}`;

function rangeLine(lang: ContentLocale): string {
  const names = categories.map((c) => c.name[lang]).join(", ");
  return lang === "nl"
    ? `${products.length} producten in ${categories.length} productgroepen: ${names}.`
    : `${categories.length} ürün grubunda ${products.length} ürün: ${names}.`;
}

export function faqFor(lang: ContentLocale): Faq[] {
  if (lang === "tr") {
    return [
      { q: "Maximus Food & Horeca nedir?", a: `Maximus Food & Horeca, horeca işletmelerine (döner ve kebap salonları, pizzacılar, snack barlar) ürün sağlayan bir toptancıdır. Şirketin resmî adı ${site.legal.name}, şirket numarası ${site.legal.companyNumber}.` },
      { q: "Depo nerede?", a: `Depomuz ${warehouse}, Belçika adresindedir.` },
      { q: "Nasıl sipariş verebilirim?", a: `WhatsApp ile ${site.phoneDisplay} numarasından ya da sitedeki sipariş formundan sipariş verebilirsiniz.` },
      { q: "Telefonla ne zaman ulaşabilirim?", a: `Pazartesiden cumartesiye 09:00 ile 15:30 arası ${site.phoneDisplay} numarasından ulaşabilirsiniz.` },
      { q: "Fiyatları nerede görürüm?", a: "Fiyatlar, işletmenizi sitede kaydettikten ve hesabınız onaylandıktan sonra görünür. Müşterilerimiz işletmelerdir." },
      { q: "Kimler Maximus'tan sipariş verebilir?", a: "Yalnızca işletmelere satış yapıyoruz; başta döner ve kebap salonları, pizzacılar ve snack barlar olmak üzere horeca işletmelerine." },
      { q: "Benim bölgeme de teslimat yapıyor musunuz?", a: "Belçika ve Hollanda'da istediğiniz her bölgeye teslimat yapıyoruz. WhatsApp'tan sormanız yeterli." },
      { q: "Siparişi kendim alırsam indirim var mı?", a: "Evet. Siparişinizi Aarschot'taki depomuzdan kendiniz alırsanız %15 indirim uygulanır." },
      { q: "Hangi ürünler var?", a: `Ürün yelpazemizde ${rangeLine("tr")}` },
      { q: "Site hangi dillerde?", a: "Site Felemenkçe, Fransızca, İngilizce ve Türkçe kullanılabilir." },
    ];
  }
  return [
    { q: "Wat is Maximus Food & Horeca?", a: `Maximus Food & Horeca is een groothandel voor de horeca: dönerzaken, kebabzaken, pizzeria's en snackbars. De vennootschap is ${site.legal.name}, ondernemingsnummer ${site.legal.companyNumber}.` },
    { q: "Waar ligt het magazijn?", a: `Ons magazijn ligt aan de ${warehouse}, België.` },
    { q: "Hoe kan ik bestellen?", a: `Via WhatsApp op ${site.phoneDisplay} of via het bestelformulier op de website.` },
    { q: "Wanneer zijn jullie telefonisch bereikbaar?", a: `Van maandag tot en met zaterdag, van 09:00 tot 15:30, op ${site.phoneDisplay}.` },
    { q: "Waar zie ik de prijzen?", a: "De prijzen zijn zichtbaar nadat u uw zaak op de website registreert en uw account is goedgekeurd. Onze klanten zijn bedrijven." },
    { q: "Wie kan bij Maximus bestellen?", a: "Wij verkopen enkel aan bedrijven, vooral horecazaken zoals dönerzaken, kebabzaken, pizzeria's en snackbars." },
    { q: "Leveren jullie ook in mijn regio?", a: "Wij leveren in elke regio die u vraagt, in België en in Nederland. Vraag het gerust via WhatsApp." },
    { q: "Is er korting als ik zelf afhaal?", a: "Ja. Haalt u uw bestelling af in ons magazijn in Aarschot, dan krijgt u 15% korting." },
    { q: "Welke producten hebben jullie?", a: `Ons assortiment telt ${rangeLine("nl")}` },
    { q: "In welke talen is de website beschikbaar?", a: "De website is beschikbaar in het Nederlands, het Frans, het Engels en het Turks." },
  ];
}

export function aboutFor(lang: ContentLocale): InfoSection[] {
  if (lang === "tr") {
    return [
      { h: "Biz kimiz", p: `Maximus Food & Horeca, ${site.legal.name} şirketinin (şirket numarası ${site.legal.companyNumber}) horeca toptan satış markasıdır. Döner ve kebap salonlarına, pizzacılara ve snack barlara ürün sağlarız.` },
      { h: "Neredeyiz", p: `Depomuz ${warehouse}, Belçika adresindedir. Siparişinizi buradan kendiniz alırsanız %15 indirim uygulanır. Belçika ve Hollanda'da istediğiniz her bölgeye teslimat yapıyoruz.` },
      { h: "Ürün yelpazesi", p: `${rangeLine("tr")} Belçika'daki ilk Munzur Su bayisiyiz.` },
      { h: "Müşterilerimiz", p: "Yalnızca işletmelere satış yapıyoruz. Fiyatları işletmenizi sitede kaydettikten sonra görürsünüz." },
      { h: "Diller", p: "Site Felemenkçe, Fransızca, İngilizce ve Türkçe kullanılabilir." },
      { h: "Nasıl sipariş verilir", p: `WhatsApp ile ${site.phoneDisplay} numarasından ya da sitedeki sipariş formundan sipariş verebilirsiniz. Telefonla pazartesiden cumartesiye 09:00 – 15:30 arası ulaşabilirsiniz.` },
    ];
  }
  return [
    { h: "Wie zijn wij", p: `Maximus Food & Horeca is de horecagroothandel van ${site.legal.name} (ondernemingsnummer ${site.legal.companyNumber}). Wij leveren aan dönerzaken, kebabzaken, pizzeria's en snackbars.` },
    { h: "Waar vindt u ons", p: `Ons magazijn ligt aan de ${warehouse}, België. Haalt u uw bestelling daar zelf af, dan krijgt u 15% korting. Wij leveren in elke regio die u vraagt, in België en Nederland.` },
    { h: "Ons assortiment", p: `${rangeLine("nl")} Wij zijn de eerste verdeler van Munzur Su in België.` },
    { h: "Onze klanten", p: "Wij verkopen enkel aan bedrijven. De prijzen ziet u nadat u uw zaak op de website registreert." },
    { h: "Talen", p: "De website is beschikbaar in het Nederlands, het Frans, het Engels en het Turks." },
    { h: "Bestellen", p: `Bestel via WhatsApp op ${site.phoneDisplay} of via het bestelformulier op de website. Telefonisch zijn wij bereikbaar van maandag tot en met zaterdag, 09:00 – 15:30.` },
  ];
}
