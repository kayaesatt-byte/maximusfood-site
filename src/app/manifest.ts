import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Web uygulama bildirimi. Telefonda "ana ekrana ekle" yapan müşteri adlandırılmış
 * bir simge görsün diye; sipariş sayfası doğrudan açılır.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Maximus",
    description: "B2B horeca groothandel — Aarschot, België",
    start_url: "/bestellen",
    display: "standalone",
    background_color: "#f7f1e8",
    theme_color: "#0e0b3a",
    lang: "nl-BE",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
