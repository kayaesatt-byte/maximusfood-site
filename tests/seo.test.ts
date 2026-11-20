import { test } from "node:test";
import assert from "node:assert/strict";
import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";
import { getPosts } from "../src/data/blog";
import { categories } from "../src/data/categories";
import { products } from "../src/data/products";
import { faqFor, aboutFor } from "../src/data/info-pages";
import { llmsText, llmsFullText } from "../src/lib/llms";
import { AI_CRAWLERS, alternatesFor, robotsFor } from "../src/lib/seo";
import { categoryPath } from "../src/lib/product";
import { localePath } from "../src/i18n/config";
import { site } from "../src/lib/site";
import { gaMeasurementId, googleSiteVerification } from "../src/lib/analytics";

test("robots: private pages are disallowed in every language", () => {
  const rule = robots().rules as { disallow: string[] };
  const rules = Array.isArray(rule) ? rule[0] : rule;
  for (const p of ["/account", "/fr/compte", "/en/account", "/tr/hesap", "/en/login", "/fr/inscription", "/tr/yonetim", "/api/"]) assert.ok(rules.disallow.includes(p), p);
});

test("sitemap: no filter URLs, x-default everywhere, blog posts linked to their translation", () => {
  const entries = sitemap();
  assert.ok(entries.every((e) => !e.url.includes("?")));
  for (const e of entries.filter((e) => e.alternates)) assert.ok(e.alternates!.languages!["x-default"], e.url);
  const posts = entries.filter((e) => /\/blog\/./.test(e.url));
  assert.equal(posts.length, getPosts("nl").length + getPosts("tr").length);
  assert.ok(posts.every((e) => Object.keys(e.alternates?.languages ?? {}).length >= 2));
});

test("turkish blog posts link to turkish pages", () => {
  for (const p of getPosts("tr")) assert.doesNotMatch(JSON.stringify(p), /href="\/(siparis|blog)/, p.slug);
});

test("analytics ids are only used when well formed", () => {
  process.env.GA_MEASUREMENT_ID = " g-ab12cd34ef ";
  assert.equal(gaMeasurementId(), "G-AB12CD34EF");
  process.env.GA_MEASUREMENT_ID = "UA-123";
  assert.equal(gaMeasurementId(), undefined);
  delete process.env.GA_MEASUREMENT_ID;
  assert.equal(gaMeasurementId(), undefined);
  process.env.GOOGLE_SITE_VERIFICATION = '"><script>';
  assert.equal(googleSiteVerification(), undefined);
  delete process.env.GOOGLE_SITE_VERIFICATION;
});

const abs = (p: string) => `https://www.maximusfood.eu${p === "/" ? "" : p}`;

test("robots: AI crawlers have their own allow group with the same private disallow list", () => {
  const rules = robots().rules as Array<{ userAgent: string | string[]; allow: string; disallow: string[] }>;
  const star = rules.find((r) => r.userAgent === "*")!;
  const ai = rules.find((r) => Array.isArray(r.userAgent))!;
  for (const bot of ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot"]) {
    assert.ok((ai.userAgent as string[]).includes(bot), bot);
  }
  assert.equal(ai.userAgent.length, AI_CRAWLERS.length);
  assert.equal(ai.allow, "/");
  assert.deepEqual(ai.disallow, star.disallow);
});

test("sitemap: category, FAQ and about pages in all four languages with four hreflang + x-default", () => {
  const entries = sitemap();
  const byUrl = new Map(entries.map((e) => [e.url, e]));
  const four = ["nl-BE", "fr-BE", "en", "tr", "x-default"];
  for (const lang of ["nl", "fr", "en", "tr"] as const) {
    for (const c of categories) {
      const e = byUrl.get(abs(categoryPath(lang, c.slug)));
      assert.ok(e, `${lang} ${c.slug}`);
      assert.deepEqual(Object.keys(e!.alternates!.languages!).sort(), [...four].sort(), `${lang} ${c.slug} hreflang`);
    }
    for (const r of ["faq", "about"] as const) assert.ok(byUrl.has(abs(localePath(lang, r))), `${lang} ${r}`);
  }
  assert.equal(byUrl.size, entries.length, "no duplicate URLs");
});

test("sitemap: lastmod is a real content date, not the build time", () => {
  const dates = new Set(sitemap().map((e) => new Date(e.lastModified as Date).toISOString().slice(0, 10)));
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(dates.size > 2, "more than one lastmod value");
  for (const d of dates) assert.ok(d <= today && d >= "2026-01-01", d);
});

test("content pages: fr/en are noindex with the Dutch canonical; translated pages index with their own canonical", () => {
  assert.equal(alternatesFor("fr", "regions", "aarschot", undefined, "content").canonical, "/regio/aarschot");
  assert.equal(alternatesFor("en", "product", "fd-szn-081", undefined, "content").canonical, "/product/fd-szn-081");
  assert.equal(alternatesFor("fr", "faq").canonical, "/fr/questions-frequentes");
  assert.equal(alternatesFor("en", "assortment", "sauzen").canonical, "/en/assortment/sauzen");
  assert.deepEqual(robotsFor("en"), { index: true, follow: true });
  assert.equal(alternatesFor("tr", "about", undefined, undefined, "content").canonical, "/tr/hakkimizda");
  assert.deepEqual(robotsFor("en", "content"), { index: false, follow: true });
  assert.deepEqual(robotsFor("tr", "content"), { index: true, follow: true });
});

/** Yazdığımız metinlerde yasak kelimeler ve fiyatlar (yalnızca %15 afhaalkorting serbest). */
const FORBIDDEN = /\b(vers|verse|taze|frais|fraîche|fresh|beste|best|goedkoopste|en ucuz|cheapest|şiş|spies|brochette|halal|helal|gecertificeerd|certified|sertifika)\b|en iyi|€|\d+[.,]\d{2}\s*(eur|euro)/i;

test("FAQ and about texts: 8-10 questions, only allowed facts, in all four languages", () => {
  for (const lang of ["nl", "fr", "en", "tr"] as const) {
    const faq = faqFor(lang);
    assert.ok(faq.length >= 8 && faq.length <= 10, `${lang} faq count`);
    const text = JSON.stringify([faq, aboutFor(lang)]);
    assert.doesNotMatch(text, FORBIDDEN, lang);
    assert.ok(text.includes(site.legal.companyNumber) && text.includes("Nieuwlandlaan 111") && text.includes(site.phoneDisplay), lang);
    for (const pct of text.match(/\d+\s*%|%\s*\d+/g) ?? []) assert.match(pct, /15/, `${lang}: only the 15% pickup discount`);
  }
  // fr/en birebir çeviri: soru sayısı ve bölüm sayısı nl ile aynı
  for (const lang of ["fr", "en"] as const) {
    assert.equal(faqFor(lang).length, faqFor("nl").length, `${lang} faq = nl`);
    assert.equal(aboutFor(lang).length, aboutFor("nl").length, `${lang} about = nl`);
    assert.notDeepEqual(faqFor(lang), faqFor("nl"), `${lang} is really translated`);
  }
});

test("llms.txt: summary with the address and key pages, no prices; full list has every product", () => {
  const short = llmsText();
  assert.match(short, /Nieuwlandlaan 111, Unit 3-4, 3200 Aarschot/);
  assert.ok(short.includes(site.legal.companyNumber) && short.includes(site.phoneDisplay));
  assert.ok(short.includes(abs(localePath("nl", "faq"))) && short.includes(abs(localePath("nl", "about"))));
  for (const c of categories) assert.ok(short.includes(abs(categoryPath("nl", c.slug))), c.slug);
  const full = llmsFullText();
  assert.ok(full.startsWith(short.split("\nFull product list")[0]), "full starts with the summary");
  for (const p of products) assert.ok(full.includes(`${p.nameNlShort}`), p.id);
  // Kendi yazdığımız özet metinde yasak kelime yok (ürün adları katalogdaki gibi kalır, ör. "Hot Fresh" pizza kutusu).
  assert.doesNotMatch(short, /\b(fresh|best|cheapest|halal)\b/i);
  for (const pct of short.match(/\d+\s*%/g) ?? []) assert.equal(pct, "15%", "only the pickup discount");
  for (const t of [short, full]) {
    assert.doesNotMatch(t, /€|\bEUR\b|\bprice:|\d+[.,]\d{2}\s*(eur|euro)/i);
  }
});

test("region pages: French text for every region, indexed in nl/fr/tr, English stays noindex", async () => {
  const { regions } = await import("../src/data/regions");
  const { regionText, regionLocales } = await import("../src/data/regions.i18n");
  const urls = new Set(sitemap().map((e) => e.url));
  for (const r of regions) {
    const fr = regionText(r, "fr");
    assert.equal(fr.lang, "fr", r.slug);
    assert.notEqual(fr.text.intro, r.nl.intro, `${r.slug} is translated`);
    assert.equal(fr.text.faq.length, r.nl.faq.length, `${r.slug} faq count`);
    assert.equal(regionText(r, "en").lang, "nl", `${r.slug} en falls back to nl`);
    for (const l of ["nl", "fr", "tr"] as const) assert.ok(urls.has(abs(localePath(l, "regions", r.slug))), `${l} ${r.slug} in sitemap`);
    assert.ok(!urls.has(abs(localePath("en", "regions", r.slug))), `en ${r.slug} not in sitemap`);
  }
  assert.deepEqual(robotsFor("fr", regionLocales), { index: true, follow: true });
  assert.deepEqual(robotsFor("en", regionLocales), { index: false, follow: true });
  assert.equal(alternatesFor("fr", "regions", "leuven", undefined, regionLocales).canonical, "/fr/zones/leuven");
  assert.equal(alternatesFor("en", "regions", "leuven", undefined, regionLocales).canonical, "/regio/leuven");
});

test("product pages: nl/fr/tr indexable, en noindex with nl canonical; sitemap has fr products", async () => {
  const { productLocales } = await import("../src/lib/product");
  assert.deepEqual([...productLocales], ["nl", "fr", "tr"]);
  assert.deepEqual(robotsFor("fr", productLocales), { index: true, follow: true });
  assert.deepEqual(robotsFor("en", productLocales), { index: false, follow: true });
  const fr = alternatesFor("fr", "product", "fd-szn-081", undefined, productLocales);
  assert.equal(fr.canonical, "/fr/produit/fd-szn-081");
  assert.equal(alternatesFor("en", "product", "fd-szn-081", undefined, productLocales).canonical, "/product/fd-szn-081");
  const { default: sitemap } = await import("../src/app/sitemap");
  const urls = sitemap().map((e) => e.url);
  assert.ok(urls.some((u) => u.endsWith("/fr/produit/fd-szn-081")));
  assert.ok(!urls.some((u) => u.includes("/en/product/")));
});
