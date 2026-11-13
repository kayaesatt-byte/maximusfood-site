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

test("sitemap: category, FAQ and about pages in Dutch and Turkish only", () => {
  const urls = new Set(sitemap().map((e) => e.url));
  for (const c of categories) {
    assert.ok(urls.has(abs(categoryPath("nl", c.slug))), c.slug);
    assert.ok(urls.has(abs(categoryPath("tr", c.slug))), c.slug);
    assert.ok(!urls.has(abs(categoryPath("fr", c.slug))) && !urls.has(abs(categoryPath("en", c.slug))), c.slug);
  }
  for (const r of ["faq", "about"] as const) {
    assert.ok(urls.has(abs(localePath("nl", r))) && urls.has(abs(localePath("tr", r))), r);
    assert.ok(!urls.has(abs(localePath("fr", r))) && !urls.has(abs(localePath("en", r))), r);
  }
  assert.equal(urls.size, sitemap().length, "no duplicate URLs");
});

test("content pages: fr/en are noindex with the Dutch canonical", () => {
  assert.equal(alternatesFor("fr", "faq", undefined, undefined, "content").canonical, "/veelgestelde-vragen");
  assert.equal(alternatesFor("en", "assortment", "sauzen", undefined, "content").canonical, "/assortiment/sauzen");
  assert.equal(alternatesFor("tr", "about", undefined, undefined, "content").canonical, "/tr/hakkimizda");
  assert.deepEqual(robotsFor("en", "content"), { index: false, follow: true });
  assert.deepEqual(robotsFor("tr", "content"), { index: true, follow: true });
});

/** Yazdığımız metinlerde yasak kelimeler ve fiyatlar (yalnızca %15 afhaalkorting serbest). */
const FORBIDDEN = /\b(vers|verse|taze|frais|fraîche|fresh|beste|best|goedkoopste|en ucuz|cheapest|şiş|spies|brochette|halal|helal|gecertificeerd|certified|sertifika)\b|en iyi|€|\d+[.,]\d{2}\s*(eur|euro)/i;

test("FAQ and about texts: 8-10 questions, only allowed facts", () => {
  for (const lang of ["nl", "tr"] as const) {
    const faq = faqFor(lang);
    assert.ok(faq.length >= 8 && faq.length <= 10, `${lang} faq count`);
    const text = JSON.stringify([faq, aboutFor(lang)]);
    assert.doesNotMatch(text, FORBIDDEN, lang);
    assert.ok(text.includes(site.legal.companyNumber) && text.includes("Nieuwlandlaan 111") && text.includes(site.phoneDisplay), lang);
    for (const pct of text.match(/\d+\s*%|%\s*\d+/g) ?? []) assert.match(pct, /15/, `${lang}: only the 15% pickup discount`);
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
