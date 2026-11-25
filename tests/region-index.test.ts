import { test } from "node:test";
import assert from "node:assert/strict";
import { regions } from "../src/data/regions";
import { isIndexableRegion, regionCustomers } from "../src/data/regionCustomers";

test("region pages: every region has a customer count, so indexing is a deliberate choice", () => {
  for (const r of regions) {
    assert.equal(typeof regionCustomers.counts[r.slug], "number", `${r.slug} has no count in regionCustomers.counts`);
  }
});

test("region pages: only regions with at least one active customer are indexable", () => {
  assert.equal(isIndexableRegion("leuven"), true);
  assert.equal(isIndexableRegion("tessenderlo"), true);
  for (const slug of ["lier", "mol", "halle", "dendermonde", "gent"]) {
    assert.equal(isIndexableRegion(slug), false, slug);
  }
  assert.equal(isIndexableRegion("onbekend"), false);
});
