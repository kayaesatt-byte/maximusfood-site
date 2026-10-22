import type { NextConfig } from "next";

/**
 * Güvenlik başlıkları her yanıta eklenir. Site denetiminde yalnızca HSTS vardı;
 * içerik türü tahmini, çerçeveye gömme ve yönlendiren sızıntısı açık kalıyordu.
 */
const securityHeaders = [
  // Tarayıcı dosya türünü tahmin etmesin (MIME karıştırma saldırıları)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Site başka bir sayfaya çerçeve içinde gömülemesin (tıklama hırsızlığı)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Dış sitelere yalnızca alan adı gitsin, tam yol gitmesin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Sitenin ihtiyaç duymadığı cihaz izinleri kapalı
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
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
