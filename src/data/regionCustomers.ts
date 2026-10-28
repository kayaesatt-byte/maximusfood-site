/**
 * Bölge başına aktif müşteri sayısı (Odoo: son 6 ayda onaylı siparişi olan farklı müşteriler).
 * Bölge sayfalarında "Bu bölgede N işletmeye teslim ediyoruz" satırı için kullanılır; 3'ten azsa satır gösterilmez
 * (tek tük müşteriyi tanınır kılmamak ve zayıf bir iddia göstermemek için).
 * Her şehir yalnızca tek bir bölgeye sayılır. Güncelleme: WEKIL MCP `aggregate` (sale.order, state=sale,
 * son 6 ay, groupby partner_id.city) → aşağıdaki sayıları elle yenileyin ve `asOf` tarihini değiştirin.
 */
export const regionCustomers = {
  asOf: "2026-10-28",
  minShown: 3,
  counts: {
    aarschot: 17,
    leuven: 36,
    tienen: 8,
    diest: 1,
    "scherpenheuvel-zichem": 1,
    tremelo: 3,
    "heist-op-den-berg": 2,
    herentals: 1,
    mechelen: 5,
    lier: 0,
    tessenderlo: 0,
    beringen: 5,
    hasselt: 2,
    "sint-truiden": 1,
    vilvoorde: 2,
    geel: 2,
    mol: 0,
    turnhout: 1,
    antwerpen: 14,
    genk: 6,
    brussel: 10,
    halle: 0,
    aalst: 5,
    dendermonde: 0,
    "sint-niklaas": 2,
    gent: 0,
    maasmechelen: 4,
    kortrijk: 11,
    oostende: 20,
    zaventem: 8,
  } as Record<string, number>,
};

export function customersIn(slug: string): number | null {
  const n = regionCustomers.counts[slug] ?? 0;
  return n >= regionCustomers.minShown ? n : null;
}
