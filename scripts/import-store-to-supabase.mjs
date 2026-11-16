import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing.");
}

const file = path.join(process.cwd(), "data", "store.json");
const database = JSON.parse(await readFile(file, "utf8"));
const requiredArrays = [
  "products",
  "orders",
  "discounts",
  "users",
  "reviews",
  "subscribers",
  "messages",
  "shopApplications",
  "shops",
  "payments"
];
if (requiredArrays.some((key) => !Array.isArray(database[key]))) {
  throw new Error("data/store.json does not match the expected Trendora database shape.");
}
database.settings ??= { shopRegistrationFeeTzs: null, shopPaymentInstructions: "" };
database.settings.shopPaymentInstructions ??= "";

for (const payment of database.payments) {
  if (payment.status === "verified") payment.status = "pending";
}
for (const application of database.shopApplications) {
  if (application.status === "ACTIVE") {
    application.status = database.payments.some(
      (payment) => payment.shopApplicationId === application.id && payment.status === "pending"
    )
      ? "PAYMENT_PROCESSING"
      : "PENDING_PAYMENT";
  }
}
for (const shop of database.shops) {
  if (shop.status === "ACTIVE") {
    const application = database.shopApplications.find(
      (entry) => entry.ownerId === shop.ownerId || entry.phone === shop.phone
    );
    shop.status = application?.status === "PAYMENT_PROCESSING" ? "PAYMENT_PROCESSING" : "PENDING_PAYMENT";
  }
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const { data: existing, error: readError } = await supabase
  .from("trendora_store")
  .select("id")
  .eq("id", 1)
  .maybeSingle();
if (readError) throw new Error(`Could not check the target store: ${readError.message}`);
if (existing) {
  throw new Error("The Supabase store is already initialized. Import will not overwrite it.");
}

const { error: insertError } = await supabase
  .from("trendora_store")
  .insert({ id: 1, version: 0, payload: database });
if (insertError) throw new Error(`Could not import data/store.json: ${insertError.message}`);

console.log("Existing store data imported into Supabase. Review shop/payment records before enabling applications.");
