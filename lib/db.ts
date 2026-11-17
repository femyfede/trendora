import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { seedDatabase } from "./seed";

const TABLE = "trendora_store";

type StoreRow = {
  version: number;
  payload: Database;
};

const COLLECTIONS = [
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
] as const;

let seedCache: Database | undefined;
function seed() {
  seedCache ??= seedDatabase();
  return seedCache;
}

/** Older stored payloads may predate newer collections; fill them in without touching existing data. */
function normalize(payload: Database): Database {
  for (const key of COLLECTIONS) {
    if (!Array.isArray(payload[key])) (payload as Record<string, unknown>)[key] = [];
  }
  payload.settings ??= { shopRegistrationFeeTzs: null, shopPaymentInstructions: "" };
  payload.settings.shopPaymentInstructions ??= "";
  return payload;
}

/* ------------------------------------------------------------------ */
/* Local development store (only when Supabase is not configured).     */
/* ------------------------------------------------------------------ */

function isLocalStore() {
  return (
    process.env.NODE_ENV !== "production" &&
    (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

const LOCAL_FILE = "data/dev-store.json";
let localWarned = false;

async function localRead(): Promise<StoreRow> {
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  if (!localWarned) {
    localWarned = true;
    console.warn(
      `[db] Supabase is not configured. Using the local development store at ${LOCAL_FILE}.`
    );
  }
  try {
    const raw = await readFile(path.join(process.cwd(), LOCAL_FILE), "utf8");
    const parsed = JSON.parse(raw) as StoreRow;
    return { version: Number(parsed.version) || 0, payload: normalize(parsed.payload) };
  } catch {
    return { version: 0, payload: normalize(structuredClone(seed())) };
  }
}

async function localWrite(row: StoreRow, payload: Database) {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const file = path.join(process.cwd(), LOCAL_FILE);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify({ version: row.version + 1, payload }, null, 2));
  return true;
}

/* ------------------------------------------------------------------ */
/* Supabase store                                                       */
/* ------------------------------------------------------------------ */

let client: SupabaseClient | undefined;

function getClient() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.");
  }
  client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  return client;
}

function databaseError(message: string, error: { code?: string; message: string }): never {
  if (error.code === "42P01" || error.code === "PGRST205") {
    throw new Error(`${message} The Supabase schema is missing; apply supabase/migrations/001_trendora_store.sql.`);
  }
  throw new Error(`${message}: ${error.message}`);
}

async function readRow(): Promise<StoreRow> {
  if (isLocalStore()) return localRead();

  const supabase = getClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("version,payload")
    .eq("id", 1)
    .maybeSingle();
  if (error) databaseError("Could not read the Supabase store", error);

  if (!data) {
    // First run: initialise the store. ignoreDuplicates never overwrites existing data.
    const { error: seedError } = await supabase
      .from(TABLE)
      .upsert({ id: 1, version: 0, payload: seed() }, { onConflict: "id", ignoreDuplicates: true });
    if (seedError) databaseError("Could not initialize the Supabase store", seedError);
    return readRow();
  }

  if (
    !data.payload ||
    !Array.isArray(data.payload.products) ||
    !Array.isArray(data.payload.orders) ||
    !Array.isArray(data.payload.users)
  ) {
    throw new Error("The Supabase store contains invalid application data.");
  }
  return { version: Number(data.version), payload: normalize(data.payload as Database) };
}

export async function readDb(): Promise<Database> {
  const row = await readRow();
  return row.payload;
}

async function tryWrite(row: StoreRow, payload: Database) {
  if (isLocalStore()) return localWrite(row, payload);
  const { data, error } = await getClient().rpc("write_trendora_store", {
    p_expected_version: row.version,
    p_payload: payload
  });
  if (error) databaseError("Could not persist the Supabase store", error);
  return Array.isArray(data) && data.length > 0;
}

let queue: Promise<unknown> = Promise.resolve();

export function mutateDb<T>(mutator: (db: Database) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const row = await readRow();
      const result = await mutator(row.payload);
      if (await tryWrite(row, row.payload)) return result;
    }
    throw new Error("The Supabase store changed repeatedly; retry the operation.");
  });
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run as Promise<T>;
}
