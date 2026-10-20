/**
 * Ölçüm ve doğrulama kimlikleri ortam değişkenlerinden gelir (Vercel → Settings → Environment Variables):
 *  - GA_MEASUREMENT_ID          Google Analytics 4 ölçüm kimliği, ör. G-AB12CD34EF (yoksa analitik ve çerez şeridi kapalı)
 *  - GOOGLE_SITE_VERIFICATION   Search Console "HTML etiketi" doğrulamasındaki content değeri (DNS ile doğrulandıysa gerekmez)
 * Değiştirince yeniden dağıtmak gerekir (sayfalar derlemede üretilir).
 */
export function gaMeasurementId(): string | undefined {
  const id = process.env.GA_MEASUREMENT_ID?.trim().toUpperCase();
  return id && /^G-[A-Z0-9]{4,}$/.test(id) ? id : undefined;
}

export function googleSiteVerification(): string | undefined {
  const v = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return v && /^[\w-]{10,100}$/.test(v) ? v : undefined;
}
