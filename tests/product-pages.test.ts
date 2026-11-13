import { test } from "node:test";
import assert from "node:assert/strict";
import { folderForSlug, localePath, locales, routeSlugs } from "../src/i18n/config";
import { altPathFor } from "../src/components/LangSwitch";
import { products, getProduct } from "../src/data/products";
import { productImages } from "../src/data/product-images";
import { brandsIn, categoryPath, hasPackaging, hasPhoto, isIndexableProduct, packagingText, productPath, productsIn, similarProducts } from "../src/lib/product";
import { categories } from "../src/data/categories";
import sitemap from "../src/app/sitemap";

test("product pages: one URL per language, mapped back to the Dutch folder", () => {
  assert.equal(productPath("nl", { id: "fd-szn-031" }), "/product/fd-szn-031");
  assert.equal(productPath("tr", { id: "fd-szn-031" }), "/tr/urun/fd-szn-031");
  assert.equal(productPath("fr", { id: "fd-szn-031" }), "/fr/produit/fd-szn-031");
  assert.equal(localePath("en", "product", "fd-szn-031"), "/en/product/fd-szn-031");
  for (const l of locales) assert.equal(folderForSlug(l, routeSlugs.product[l]), "product", l);
  assert.equal(altPathFor("/product/fd-szn-031", "nl", "tr"), "/tr/urun/fd-szn-031");
  assert.equal(altPathFor("/tr/urun/fd-szn-031", "tr", "fr"), "/fr/produit/fd-szn-031");
});

test("product pages: every product id is unique and safe in a URL", () => {
  const ids = products.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/, id);
  assert.ok(getProduct(ids[0]));
});

test("product pages: similar products come from the same group, never the product itself", () => {
  for (const p of products.slice(0, 80)) {
    const sim = similarProducts(p, 8);
    assert.ok(sim.length <= 8);
    assert.ok(sim.every((q) => q.id !== p.id && q.category === p.category), p.id);
  }
  const p = products.find((q) => q.brand === "Pauwels")!;
  const first = similarProducts(p, 3);
  assert.ok(first.every((q) => q.brand === "Pauwels"), "same brand first");
});

test("product pages: packaging text follows the language of the catalogue", () => {
  const bulk = products.find((p) => p.unitSize === "Adet" && p.unitsPerCase > 1)!;
  assert.match(packagingText(bulk, "nl"), /stuks$/);
  assert.match(packagingText(bulk, "en"), /stuks$/, "fr/en read the Dutch catalogue");
  assert.match(packagingText(bulk, "tr"), /adet$/);
  const crate = products.find((p) => p.unitSize !== "Adet" && p.unitsPerCase > 1)!;
  assert.equal(packagingText(crate, "nl"), `${crate.unitsPerCase} x ${crate.unitSize}`);
});

test("product pages: index rule is brand + packaging, photo products stay indexed", () => {
  const base = { id: "x-no-photo", brand: "Pauwels", unitSize: "1 L", unitsPerCase: 1 };
  assert.equal(isIndexableProduct(base), true, "brand + unit size");
  assert.equal(isIndexableProduct({ ...base, unitSize: "Adet", unitsPerCase: 6 }), true, "brand + units per case");
  assert.equal(isIndexableProduct({ ...base, unitSize: "Adet", unitsPerCase: 1 }), false, "'1 stuk' is no packaging information");
  assert.equal(isIndexableProduct({ ...base, brand: " " }), false, "no brand");
  assert.equal(hasPackaging({ unitSize: "", unitsPerCase: 1 }), false);
  for (const p of products.filter(hasPhoto)) assert.ok(isIndexableProduct(p), `${p.id} had a photo and was indexed before`);
  const indexable = products.filter(isIndexableProduct);
  assert.ok(indexable.length > products.filter(hasPhoto).length, "more pages than the photo-only rule");
  assert.ok(products.some((p) => !hasPhoto(p) && isIndexableProduct(p)), "photo-less pages can be indexed");
});

test("product pages: the sitemap lists exactly the indexable products, in Dutch and Turkish only", () => {
  const urls = new Set(sitemap().map((e) => e.url));
  const abs = (path: string) => `https://www.maximusfood.eu${path}`;
  for (const p of products) {
    const want = isIndexableProduct(p);
    assert.equal(urls.has(abs(productPath("nl", p))), want, `nl ${p.id}`);
    assert.equal(urls.has(abs(productPath("tr", p))), want, `tr ${p.id}`);
    assert.ok(!urls.has(abs(productPath("fr", p))) && !urls.has(abs(productPath("en", p))), `fr/en ${p.id} is noindex, not listed`);
  }
  assert.equal([...urls].filter((u) => /\/(product|tr\/urun)\//.test(u)).length, products.filter(isIndexableProduct).length * 2);
  assert.equal(products.filter(hasPhoto).length, Object.keys(productImages).filter((id) => getProduct(id)).length);
});

test("category pages: one per group, localized URL, products and brands from the data", () => {
  assert.equal(categoryPath("nl", "sauzen"), "/assortiment/sauzen");
  assert.equal(categoryPath("tr", "sauzen"), "/tr/urun-gruplari/sauzen");
  assert.equal(categoryPath("fr", "sauzen"), "/fr/assortiment/sauzen");
  assert.equal(altPathFor("/assortiment/sauzen", "nl", "tr"), "/tr/urun-gruplari/sauzen");
  assert.equal(folderForSlug("tr", "urun-gruplari"), "assortiment");
  let total = 0;
  for (const c of categories) {
    const items = productsIn(c.slug);
    total += items.length;
    assert.ok(items.length > 0, c.slug);
    assert.ok(items.every((p) => p.category === c.slug));
    const brands = brandsIn(c.slug);
    assert.equal(new Set(brands).size, brands.length);
    assert.ok(items.every((p) => brands.includes(p.brand)), `${c.slug} brands complete`);
  }
  assert.equal(total, products.length);
});
