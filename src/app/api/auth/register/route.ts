import { NextResponse } from "next/server";
import { getStore } from "@/server/store";
import { hashPassword, publicProfile, setSessionCookie } from "@/server/auth";
import { notifyOwnerNewRegistration } from "@/server/notify";
import { parsePhones, validPhone } from "@/server/phones";


export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = (await req.json()) as Record<string, string>;
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const email = (body.email ?? "").toLowerCase().trim();
  const password = body.password ?? "";
  const company = (body.company ?? "").trim();
  const firstName = (body.firstName ?? "").trim();
  const lastName = (body.lastName ?? "").trim();
  const contact = `${firstName} ${lastName}`.trim();
  const phone = (body.phone ?? "").trim();
  const street = (body.street ?? "").trim();
  const postcode = (body.postcode ?? "").trim();
  const city = (body.city ?? "").trim();
  const extraPhones = parsePhones(body.extraPhones);
  const consent = body.consent === "on" || body.consent === "true" || (body.consent as unknown) === true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || !company || !firstName || !lastName || !validPhone(phone) || !street || !postcode || !city) {
    return NextResponse.json({ error: "required" }, { status: 400 });
  }
  if (!consent) return NextResponse.json({ error: "consent" }, { status: 400 });
  const store = getStore();
  if (await store.getCustomerByEmail(email)) {
    return NextResponse.json({ error: "exists" }, { status: 409 });
  }
  const customer = await store.createCustomer({
    email,
    passwordHash: hashPassword(password),
    company,
    vat: (body.vat ?? "").trim() || undefined,
    firstName,
    lastName,
    contact,
    phone,
    street,
    postcode,
    city,
    ...(extraPhones.length ? { extraPhones } : {}),
    consentAt: new Date().toISOString(),
    country: (body.country ?? "BE").trim() || "BE",
    businessType: (body.businessType ?? "").trim() || undefined,
    lang: body.lang === "tr" ? "tr" : "nl",
    status: "pending",
  });
  void notifyOwnerNewRegistration(customer);
  await setSessionCookie(customer.id);
  return NextResponse.json({ customer: publicProfile(customer) }, { status: 201 });
}
