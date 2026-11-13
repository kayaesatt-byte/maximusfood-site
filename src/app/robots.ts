import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { AI_CRAWLERS } from "@/lib/seo";
import { localePath, locales, type RouteKey } from "@/i18n/config";

/** Hesap, giriş, kayıt ve yönetim sayfaları her dilde taranmaz (sayfalar ayrıca noindex). */
const PRIVATE: RouteKey[] = ["account", "login", "register", "admin"];

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", ...new Set(locales.flatMap((l) => PRIVATE.map((r) => localePath(l, r))))];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: [...AI_CRAWLERS], allow: "/", disallow },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
