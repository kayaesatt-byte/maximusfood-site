import type { NextConfig } from "next";

/**
 * Güvenlik başlıkları (SEO/GEO denetimi 19.11.2026, madde 7).
 *
 * CSP şimdilik yalnızca "Report-Only": tarayıcı ihlalleri konsola yazar ama hiçbir şeyi engellemez.
 * Sayfalar derleme anında üretildiği (statik) için nonce kullanılamıyor; Next.js'in satır içi
 * betikleri ve JSON-LD için 'unsafe-inline' gerekiyor. Birkaç gün konsolda ihlal görülmezse
 * başlık adı "Content-Security-Policy" yapılarak zorunlu hâle getirilebilir.
 * Google Analytics yalnızca çerez onayından sonra yüklenir (CookieConsent.tsx), alan adları bu yüzden listede.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" /* includeSubDomains/preload bilinçli olarak yok: alt alan adlarının hepsi HTTPS'e hazır olmadan eklenmemeli */ },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
