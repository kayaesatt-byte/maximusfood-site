import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePhones, validPhone } from "../src/server/phones";
import { PgStore, setSqlForTests, phoneKey } from "../src/server/store-pg";

test("signup phones: other WhatsApp numbers are cleaned, deduplicated and capped", () => {
  assert.equal(validPhone("0467 07 71 64"), true);
  assert.equal(validPhone("123"), false);
  assert.deepEqual(parsePhones("+32 470 11 22 33\n0470112233, 0488/99.88.77;abc"), ["+32 470 11 22 33", "0488/99.88.77"]);
  assert.equal(parsePhones("0470000001\n0470000002\n0470000003\n0470000004\n0470000005\n0470000006").length, 5);
  assert.deepEqual(parsePhones(undefined), []);
  assert.equal(phoneKey("+32 467 07 71 64"), "32467077164");
  assert.equal(phoneKey("0467 07 71 64"), "32467077164");
});

/** A tiny stand-in for Postgres that understands the statements store-pg.ts sends. */
function fakeDb() {
  const t = { customers: [] as Array<Record<string, unknown>>, orders: [] as Array<Record<string, unknown>>, lists: [] as Array<Record<string, unknown>>, convs: [] as Array<Record<string, unknown>> };
  const sql = async (text: string, p: unknown[] = []): Promise<Array<Record<string, unknown>>> => {
    if (/^CREATE /.test(text)) return [];
    if (text.startsWith("INSERT INTO site_customers")) {
      if (t.customers.some((c) => c.email === p[1])) throw new Error("duplicate email");
      t.customers.push({ id: p[0], email: p[1], phones: p[2], status: p[3], created_at: p[4], data: JSON.parse(String(p[5])) });
      return [];
    }
    if (text.includes("FROM site_customers WHERE email")) return t.customers.filter((c) => c.email === p[0]);
    if (text.includes("FROM site_customers WHERE id")) return t.customers.filter((c) => c.id === p[0]);
    if (text.includes("ANY(phones)")) return t.customers.filter((c) => (c.phones as string[]).includes(String(p[0])));
    if (text.startsWith("SELECT status, data FROM site_customers ORDER")) return [...t.customers].reverse();
    if (text.startsWith("UPDATE site_customers")) {
      const c = t.customers.find((x) => x.id === p[0]);
      if (!c) return [];
      c.status = p[1];
      c.data = { ...(c.data as object), ...JSON.parse(String(p[2])) };
      return [c];
    }
    if (text.startsWith("INSERT INTO site_orders")) { t.orders.push({ id: p[0], customer_id: p[1], data: JSON.parse(String(p[3])) }); return []; }
    if (text.includes("FROM site_orders WHERE customer_id")) return t.orders.filter((o) => o.customer_id === p[0]);
    if (text.startsWith("DELETE FROM site_lists")) { t.lists = t.lists.filter((l) => !(l.customer_id === p[0] && l.id === p[1])); return []; }
    if (text.includes("FROM site_lists WHERE customer_id = $1 AND name_key")) return t.lists.filter((l) => l.customer_id === p[0] && l.name_key === p[1]);
    if (text.startsWith("INSERT INTO site_lists")) {
      t.lists = t.lists.filter((l) => !(l.customer_id === p[1] && l.name_key === p[2]));
      t.lists.push({ id: p[0], customer_id: p[1], name_key: p[2], data: JSON.parse(String(p[4])) });
      return [];
    }
    if (text.includes("FROM site_lists WHERE customer_id")) return t.lists.filter((l) => l.customer_id === p[0]);
    if (text.startsWith("INSERT INTO site_conversations")) { t.convs = t.convs.filter((c) => c.phone !== p[0]); t.convs.push({ phone: p[0], data: JSON.parse(String(p[1])) }); return []; }
    if (text.includes("FROM site_conversations")) return t.convs.filter((c) => c.phone === p[0]);
    throw new Error(`unexpected SQL: ${text.slice(0, 60)}`);
  };
  return { t, sql };
}

test("PgStore: customers with extra numbers, status from WEKIL, orders and lists survive in Postgres", async () => {
  const db = fakeDb();
  setSqlForTests(db.sql);
  const store = new PgStore();
  const c = await store.createCustomer({ email: "Zaak@Example.com", passwordHash: "x", company: "Zaak", firstName: "Ali", lastName: "Y", contact: "Ali Y", phone: "0467 07 71 64", extraPhones: ["+32 470 11 22 33"], street: "Straat 1", postcode: "3200", city: "Aarschot", country: "BE", lang: "nl", status: "pending", consentAt: new Date().toISOString() });
  assert.deepEqual(db.t.customers[0].phones, ["32467077164", "32470112233"]);
  assert.equal((await store.getCustomerByEmail("zaak@example.com"))?.id, c.id);
  assert.equal((await store.getCustomerByPhone("0470 11 22 33"))?.id, c.id, "a staff number finds the business");
  // WEKIL approves in its approval centre: it only changes the status column.
  db.t.customers[0].status = "approved";
  assert.equal((await store.getCustomerById(c.id))?.status, "approved");
  await store.setCustomerStatus(c.id, "rejected");
  assert.equal((await store.getCustomerById(c.id))?.status, "rejected");
  await store.createOrder({ customerId: c.id, delivery: "adres", lines: [{ productId: "p1", cases: 2, units: 0 }], status: "whatsapp", source: "web" });
  assert.equal((await store.listOrders(c.id)).length, 1);
  await store.saveList({ customerId: c.id, name: "Dinsdag", lines: [{ productId: "p1", cases: 1, units: 0 }] });
  await store.saveList({ customerId: c.id, name: "dinsdag", lines: [{ productId: "p1", cases: 3, units: 0 }] });
  const lists = await store.listSavedLists(c.id);
  assert.equal(lists.length, 1, "same name updates instead of duplicating");
  assert.equal(lists[0].lines[0].cases, 3);
  await store.deleteList(c.id, lists[0].id);
  assert.equal((await store.listSavedLists(c.id)).length, 0);
  await store.saveConversation({ phone: "+32 470 11 22 33", lang: "nl", draft: [], history: [], updatedAt: "" });
  assert.ok(await store.getConversation("0470112233"));
  setSqlForTests(null);
});
