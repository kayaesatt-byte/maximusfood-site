import { Beef, Snowflake, Package, CupSoda, Wheat, Droplets, Archive, SprayCan, Milk, Croissant, type LucideIcon } from "lucide-react";

const map: Record<string, { Icon: LucideIcon; cls: string }> = {
  sauzen: { Icon: Droplets, cls: "bg-amber-100 text-amber-700" },
  "vlees-doner": { Icon: Beef, cls: "bg-red-100 text-red-700" },
  diepvries: { Icon: Snowflake, cls: "bg-sky-100 text-sky-700" },
  conserven: { Icon: Archive, cls: "bg-lime-100 text-lime-800" },
  "kaas-zuivel": { Icon: Milk, cls: "bg-orange-100 text-orange-700" },
  "brood-deeg": { Icon: Croissant, cls: "bg-amber-100 text-amber-800" },
  ambalaj: { Icon: Package, cls: "bg-stone-200 text-stone-700" },
  dranken: { Icon: CupSoda, cls: "bg-blue-100 text-blue-700" },
  "droge-voeding": { Icon: Wheat, cls: "bg-yellow-100 text-yellow-800" },
  hijyen: { Icon: SprayCan, cls: "bg-teal-100 text-teal-700" },
};

export default function ProductIcon({ category, size = "md" }: { category: string; size?: "sm" | "md" | "lg" }) {
  const entry = map[category] ?? map.ambalaj;
  const dim = size === "sm" ? "h-9 w-9" : size === "lg" ? "h-24 w-24 sm:h-28 sm:w-28" : "h-11 w-11";
  const icon = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-11 w-11 sm:h-12 sm:w-12" : "h-5 w-5";
  return (
    <span className={`flex ${dim} shrink-0 items-center justify-center ${size === "lg" ? "rounded-3xl" : "rounded-lg"} ${entry.cls}`} aria-hidden>
      <entry.Icon className={icon} />
    </span>
  );
}
