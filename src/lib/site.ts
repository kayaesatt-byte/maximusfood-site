export const site = {
  name: "MAXIMUS Food & Horeca",
  shortName: "Maximus",
  tagline: "Quality Food. Trusted Partner.",
  founded: 2020,
  address: {
    street: "Nieuwlandlaan 111, Unit 3-4",
    postal: "3200",
    city: "Aarschot",
    // Posta adresi yerel dilde yazılır; site dili ne olursa olsun Felemenkçe kalır.
    country: "België",
    full: "Nieuwlandlaan 111, Unit 3-4, 3200 Aarschot, België",
  },
  /** Wettelijke gegevens (KBO); verplicht op de website (WER art. III.74) en gelijk aan de Meta-bedrijfsverificatie. */
  legal: {
    name: "MAXIMUS BV",
    form: "BV",
    companyNumber: "0500.738.447",
    vat: "BE 0500.738.447",
    vatId: "BE0500738447",
    incorporated: "2012-11-12",
    registeredOffice: { street: "Windmolenstraat 70", postal: "3930", city: "Hamont-Achel", country: "België" },
  },
  phone: "+32 467 07 71 64",
  phoneDisplay: "+32 467 07 71 64",
  whatsapp: "32467077164",
  /** Sosyal medya hesapları (footer ve Google yapılandırılmış veri). */
  social: { instagram: "https://www.instagram.com/maximus.food.eu/" },
  email: "info@maximusfood.eu",
  hours: "Pzt – Cmt 09:00 – 15:30",
  pickupDiscount: 0.15,
  url: "https://www.maximusfood.eu",
  serviceArea: "Belçika & Hollanda",
  geo: { lat: 50.9932, lng: 4.8377 },
};

/** Ürün yelpazesindeki markalar. Logo yok: marka sahiplerinin izni olmadan logo kullanılmaz (Esat, 27.10.2026). */
export type Partner = {
  name: string;
};

export const partners: Partner[] = [
  { name: "Dostfood" },
  { name: "Lipton" },
  { name: "Polat Dönerproduktion" },
  { name: "Pauwels Sauces" },
  { name: "Düzgün" },
  { name: "Poco Loco" },
  { name: "Ceres" },
  { name: "Van Reusel" },
  { name: "Pepsi" },
  { name: "Lutosa" },
  { name: "Coca-Cola" },
  { name: "Foster" },
  { name: "Caputo" },
  { name: "Mekkafood" },
  { name: "Fırat Bakery" },
  { name: "Ruco Foods" },
  { name: "Epic Seafood" },
];

export const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Nieuwlandlaan 111, 3200 Aarschot, Belgium");
