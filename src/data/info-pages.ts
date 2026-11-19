/**
 * Sık sorulan sorular ve "Over ons / Hakkımızda" sayfalarının metni, dört dilde (nl, fr, en, tr).
 * Dört dil de dizine girer (SEO denetimi 19.11.2026); fr/en metni nl metninin birebir karşılığıdır,
 * nl metni değişirse fr/en de aynı gün güncellenmelidir.
 *
 * Kural: buraya yalnızca doğrulanmış bilgiler yazılır (13.11.2026 listesi). Fiyat, en az sipariş tutarı,
 * teslimat günü/saati/ücreti, müşteri sayısı, sertifika, "taze/en iyi/en ucuz" gibi iddialar YAZILMAZ.
 * Şirket adı, numarası ve adres src/lib/site.ts'ten okunur; ürün ve grup sayıları src/data'dan hesaplanır.
 */
import { site } from "@/lib/site";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { categoryName } from "@/data/categories.i18n";
import type { Locale } from "@/i18n/config";

export type Faq = { q: string; a: string };
export type InfoSection = { h: string; p: string };

const warehouse = `${site.address.street}, ${site.address.postal} ${site.address.city}`;

function rangeLine(lang: Locale): string {
  const names = categories.map((c) => categoryName(c, lang)).join(", ");
  if (lang === "tr") return `${categories.length} ürün grubunda ${products.length} ürün: ${names}.`;
  if (lang === "fr") return `${products.length} produits répartis en ${categories.length} gammes : ${names}.`;
  if (lang === "en") return `${products.length} products in ${categories.length} product groups: ${names}.`;
  return `${products.length} producten in ${categories.length} productgroepen: ${names}.`;
}

export function faqFor(lang: Locale): Faq[] {
  if (lang === "fr") {
    return [
      { q: "Qu'est-ce que Maximus Food & Horeca ?", a: `Maximus Food & Horeca est un grossiste pour l'horeca : kebabs, döners, pizzerias et snack-bars. La société est ${site.legal.name}, numéro d'entreprise ${site.legal.companyNumber}.` },
      { q: "Où se trouve l'entrepôt ?", a: `Notre entrepôt se trouve ${warehouse}, Belgique.` },
      { q: "Comment passer commande ?", a: `Par WhatsApp au ${site.phoneDisplay} ou via le formulaire de commande sur le site.` },
      { q: "Quand êtes-vous joignables par téléphone ?", a: `Du lundi au samedi, de 09:00 à 15:30, au ${site.phoneDisplay}.` },
      { q: "Où puis-je voir les prix ?", a: "Les prix sont visibles une fois votre établissement enregistré sur le site et votre compte approuvé. Nos clients sont des entreprises." },
      { q: "Qui peut commander chez Maximus ?", a: "Nous vendons uniquement aux entreprises, principalement aux établissements horeca comme les döners, kebabs, pizzerias et snack-bars." },
      { q: "Livrez-vous aussi dans ma région ?", a: "Nous livrons dans toute région que vous nous demandez, en Belgique et aux Pays-Bas. Demandez-le simplement par WhatsApp." },
      { q: "Y a-t-il une remise si je viens chercher moi-même ?", a: "Oui. Si vous venez chercher votre commande à notre entrepôt d'Aarschot, vous bénéficiez de 15 % de remise." },
      { q: "Quels produits proposez-vous ?", a: `Notre assortiment compte ${rangeLine("fr")}` },
      { q: "Dans quelles langues le site est-il disponible ?", a: "Le site est disponible en néerlandais, en français, en anglais et en turc." },
    ];
  }
  if (lang === "en") {
    return [
      { q: "What is Maximus Food & Horeca?", a: `Maximus Food & Horeca is a wholesaler for the horeca trade: döner and kebab shops, pizzerias and snack bars. The company is ${site.legal.name}, company number ${site.legal.companyNumber}.` },
      { q: "Where is the warehouse?", a: `Our warehouse is at ${warehouse}, Belgium.` },
      { q: "How can I order?", a: `Via WhatsApp on ${site.phoneDisplay} or through the order form on the website.` },
      { q: "When can I reach you by phone?", a: `Monday to Saturday, 09:00 to 15:30, on ${site.phoneDisplay}.` },
      { q: "Where can I see the prices?", a: "Prices are shown after you register your business on the website and your account is approved. Our customers are businesses." },
      { q: "Who can order from Maximus?", a: "We sell to businesses only, mainly horeca businesses such as döner and kebab shops, pizzerias and snack bars." },
      { q: "Do you deliver in my area?", a: "We deliver to any area you ask for, in Belgium and the Netherlands. Just ask us on WhatsApp." },
      { q: "Is there a discount if I collect the order myself?", a: "Yes. If you collect your order at our warehouse in Aarschot, you get a 15% discount." },
      { q: "Which products do you sell?", a: `Our range has ${rangeLine("en")}` },
      { q: "Which languages is the website available in?", a: "The website is available in Dutch, French, English and Turkish." },
    ];
  }
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

export function aboutFor(lang: Locale): InfoSection[] {
  if (lang === "fr") {
    return [
      { h: "Qui sommes-nous", p: `Maximus Food & Horeca est la marque de vente en gros pour l'horeca de ${site.legal.name} (numéro d'entreprise ${site.legal.companyNumber}). Nous fournissons les döners, kebabs, pizzerias et snack-bars.` },
      { h: "Où nous trouver", p: `Notre entrepôt se trouve ${warehouse}, Belgique. Si vous y venez chercher votre commande vous-même, vous bénéficiez de 15 % de remise. Nous livrons dans toute région que vous nous demandez, en Belgique et aux Pays-Bas.` },
      { h: "Notre assortiment", p: `${rangeLine("fr")} Nous sommes le premier distributeur de Munzur Su en Belgique.` },
      { h: "Nos clients", p: "Nous vendons uniquement aux entreprises. Vous voyez les prix après avoir enregistré votre établissement sur le site." },
      { h: "Langues", p: "Le site est disponible en néerlandais, en français, en anglais et en turc." },
      { h: "Commander", p: `Commandez par WhatsApp au ${site.phoneDisplay} ou via le formulaire de commande sur le site. Par téléphone, nous sommes joignables du lundi au samedi, de 09:00 à 15:30.` },
    ];
  }
  if (lang === "en") {
    return [
      { h: "Who we are", p: `Maximus Food & Horeca is the horeca wholesale brand of ${site.legal.name} (company number ${site.legal.companyNumber}). We supply döner and kebab shops, pizzerias and snack bars.` },
      { h: "Where to find us", p: `Our warehouse is at ${warehouse}, Belgium. If you collect your order there yourself, you get a 15% discount. We deliver to any area you ask for, in Belgium and the Netherlands.` },
      { h: "Our range", p: `${rangeLine("en")} We are the first Munzur Su distributor in Belgium.` },
      { h: "Our customers", p: "We sell to businesses only. You see the prices after you register your business on the website." },
      { h: "Languages", p: "The website is available in Dutch, French, English and Turkish." },
      { h: "Ordering", p: `Order via WhatsApp on ${site.phoneDisplay} or through the order form on the website. By phone we are available Monday to Saturday, 09:00 to 15:30.` },
    ];
  }
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
