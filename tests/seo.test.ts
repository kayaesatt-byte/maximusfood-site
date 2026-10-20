import { test } from "node:test";
import assert from "node:assert/strict";
import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";
import { getPosts } from "../src/data/blog";
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
