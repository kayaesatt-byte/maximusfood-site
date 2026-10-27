import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import type { ConversationState, CustomerRecord, CustomerStore, OrderRecord, SavedList } from "./store";

/**
 * Customer store on Postgres (Neon). The database is shared with WEKIL (crm.wekil.app), which reads `site_customers`
 * for its approval centre and writes back the status ("approved"/"rejected") and the Odoo customer id. Every record is
 * kept whole in `data` (jsonb); the columns beside it exist for lookups. All queries are parameterised.
 */
export type Sql = (text: string, params?: unknown[]) => Promise<Array<Record<string, unknown>>>;

let override: Sql | null = null;
let client: Sql | null = null;
/** Tests replace the database with a fake. */
export function setSqlForTests(sql: Sql | null): void {
  override = sql;
  ready = null;
}

function sql(): Sql {
  if (override) return override;
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    const q = neon(url);
    client = (text, params = []) => q.query(text, params) as Promise<Array<Record<string, unknown>>>;
  }
  return client;
}

export const phoneKey = (p: string): string => p.replace(/[^\d]/g, "").replace(/^00/, "").replace(/^0/, "32");

let ready: Promise<void> | null = null;
/** Creates the tables once per server instance (idempotent). */
export function ensureSiteSchema(): Promise<void> {
  if (!ready) {
    const run = sql();
    ready = (async () => {
      await run("CREATE TABLE IF NOT EXISTS site_customers (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, phones TEXT[] NOT NULL DEFAULT '{}', status TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), data JSONB NOT NULL)");
      await run("CREATE INDEX IF NOT EXISTS site_customers_phones ON site_customers USING GIN (phones)");
      await run("CREATE INDEX IF NOT EXISTS site_customers_status ON site_customers (status, created_at)");
      await run("CREATE TABLE IF NOT EXISTS site_orders (id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), data JSONB NOT NULL)");
      await run("CREATE INDEX IF NOT EXISTS site_orders_customer ON site_orders (customer_id, created_at)");
      await run("CREATE TABLE IF NOT EXISTS site_lists (id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, name_key TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), data JSONB NOT NULL, UNIQUE (customer_id, name_key))");
      await run("CREATE TABLE IF NOT EXISTS site_conversations (phone TEXT PRIMARY KEY, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), data JSONB NOT NULL)");
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

async function q(text: string, params: unknown[] = []): Promise<Array<Record<string, unknown>>> {
  await ensureSiteSchema();
  return sql()(text, params);
}

const json = (v: unknown) => (typeof v === "string" ? JSON.parse(v) : v);
/** The status column is the truth: WEKIL changes it when staff approve or reject. */
const customer = (r: Record<string, unknown>): CustomerRecord => ({ ...(json(r.data) as CustomerRecord), status: String(r.status) as CustomerRecord["status"] });

export class PgStore implements CustomerStore {
  async getCustomerByEmail(email: string) {
    const [r] = await q("SELECT status, data FROM site_customers WHERE email = $1", [email.toLowerCase().trim()]);
    return r ? customer(r) : undefined;
  }
  async getCustomerById(id: string) {
    const [r] = await q("SELECT status, data FROM site_customers WHERE id = $1", [id]);
    return r ? customer(r) : undefined;
  }
  async getCustomerByPhone(phone: string) {
    const [r] = await q("SELECT status, data FROM site_customers WHERE $1 = ANY(phones) ORDER BY created_at LIMIT 1", [phoneKey(phone)]);
    return r ? customer(r) : undefined;
  }
  async createCustomer(c: Omit<CustomerRecord, "id" | "createdAt">) {
    const rec: CustomerRecord = { ...c, email: c.email.toLowerCase().trim(), id: randomUUID(), createdAt: new Date().toISOString() };
    const phones = [...new Set([rec.phone, ...(rec.extraPhones ?? [])].map(phoneKey).filter((p) => p.length >= 8))];
    await q("INSERT INTO site_customers (id, email, phones, status, created_at, data) VALUES ($1, $2, $3, $4, $5, $6)", [rec.id, rec.email, phones, rec.status, rec.createdAt, JSON.stringify(rec)]);
    return rec;
  }
  async listCustomers() {
    return (await q("SELECT status, data FROM site_customers ORDER BY created_at DESC LIMIT 2000")).map(customer);
  }
  async setCustomerStatus(id: string, status: CustomerRecord["status"]) {
    const extra = status === "approved" ? { approvedAt: new Date().toISOString() } : {};
    const [r] = await q("UPDATE site_customers SET status = $2, data = data || $3::jsonb WHERE id = $1 RETURNING status, data", [id, status, JSON.stringify({ status, ...extra })]);
    return r ? customer(r) : undefined;
  }
  async listAllOrders(limit = 50) {
    return (await q("SELECT data FROM site_orders ORDER BY created_at DESC LIMIT $1", [limit])).map((r) => json(r.data) as OrderRecord);
  }
  async listOrders(customerId: string, limit = 20) {
    return (await q("SELECT data FROM site_orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2", [customerId, limit])).map((r) => json(r.data) as OrderRecord);
  }
  async createOrder(o: Omit<OrderRecord, "id" | "createdAt">) {
    const rec: OrderRecord = { ...o, id: randomUUID(), createdAt: new Date().toISOString() };
    await q("INSERT INTO site_orders (id, customer_id, created_at, data) VALUES ($1, $2, $3, $4)", [rec.id, rec.customerId, rec.createdAt, JSON.stringify(rec)]);
    return rec;
  }
  async listSavedLists(customerId: string) {
    return (await q("SELECT data FROM site_lists WHERE customer_id = $1 ORDER BY updated_at DESC", [customerId])).map((r) => json(r.data) as SavedList);
  }
  async saveList(l: Omit<SavedList, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const nameKey = l.name.trim().toLowerCase();
    const [existing] = await q("SELECT data FROM site_lists WHERE customer_id = $1 AND name_key = $2", [l.customerId, nameKey]);
    const rec: SavedList = existing ? { ...(json(existing.data) as SavedList), lines: l.lines, updatedAt: now } : { ...l, id: randomUUID(), createdAt: now, updatedAt: now };
    await q(
      "INSERT INTO site_lists (id, customer_id, name_key, updated_at, data) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (customer_id, name_key) DO UPDATE SET updated_at = EXCLUDED.updated_at, data = EXCLUDED.data",
      [rec.id, rec.customerId, nameKey, now, JSON.stringify(rec)],
    );
    return rec;
  }
  async deleteList(customerId: string, listId: string) {
    await q("DELETE FROM site_lists WHERE customer_id = $1 AND id = $2", [customerId, listId]);
  }
  async getConversation(phone: string) {
    const [r] = await q("SELECT data FROM site_conversations WHERE phone = $1", [phoneKey(phone)]);
    return r ? (json(r.data) as ConversationState) : undefined;
  }
  async saveConversation(state: ConversationState) {
    const data = { ...state, updatedAt: new Date().toISOString() };
    await q("INSERT INTO site_conversations (phone, updated_at, data) VALUES ($1, now(), $2) ON CONFLICT (phone) DO UPDATE SET updated_at = now(), data = EXCLUDED.data", [phoneKey(state.phone), JSON.stringify(data)]);
  }
}
