import { test } from "node:test";
import assert from "node:assert/strict";
import { folderForSlug, localePath, locales, routeSlugs } from "../src/i18n/config";
import { altPathFor } from "../src/components/LangSwitch";
import { products, getProduct } from "../src/data/products";
import { productImages } from "../src/data/product-images";
import { hasPhoto, packagingText, productPath, similarProducts } from "../src/lib/product";
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

test("product pages: only products with a photo are in the sitemap, in Dutch and Turkish", () => {
  const urls = new Set(sitemap().map((e) => e.url));
  const withPhoto = products.filter(hasPhoto);
  assert.equal(withPhoto.length, Object.keys(productImages).filter((id) => getProduct(id)).length);
  for (const p of withPhoto) {
    assert.ok(urls.has(`https://www.maximusfood.eu${productPath("nl", p)}`) || [...urls].some((u) => u.endsWith(productPath("nl", p))), p.id);
    assert.ok([...urls].some((u) => u.endsWith(productPath("tr", p))), p.id);
    assert.ok(![...urls].some((u) => u.endsWith(productPath("fr", p))), "fr is noindex, not listed");
  }
  const bare = products.find((p) => !hasPhoto(p))!;
  assert.ok(![...urls].some((u) => u.endsWith(productPath("nl", bare))), "no photo, no sitemap entry");
});
