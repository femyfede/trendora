import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { seedDatabase } from "./seed";

const TABLE = "trendora_store";
const seed = seedDatabase();

type StoreRow = {
  version: number;
  payload: Database;
};

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

function databaseError(message: string, error: { code?: string; message: string }) {
  if (error.code === "42P01" || error.code === "PGRST205") {
    throw new Error(`${message} The Supabase schema is missing; apply supabase/migrations/001_trendora_store.sql.`);
  }
  throw new Error(`${message}: ${error.message}`);
}

async function readRow(): Promise<StoreRow> {
  const supabase = getClient();
  const { error: seedError } = await supabase.from(TABLE).upsert(
    { id: 1, version: 0, payload: seed },
    { onConflict: "id", ignoreDuplicates: true }
  );
  if (seedError) databaseError("Could not initialize the Supabase store", seedError);

  const { data, error } = await supabase
    .from(TABLE)
    .select("version,payload")
    .eq("id", 1)
    .single();
  if (error) databaseError("Could not read the Supabase store", error);
  if (
    !data ||
    !data.payload ||
    !Array.isArray(data.payload.products) ||
    !Array.isArray(data.payload.orders) ||
    !Array.isArray(data.payload.users)
  ) {
    throw new Error("The Supabase store contains invalid application data.");
  }
  const payload = data.payload as Database;
  payload.settings ??= { shopRegistrationFeeTzs: null, shopPaymentInstructions: "" };
  payload.settings.shopPaymentInstructions ??= "";
  return { version: Number(data.version), payload };
}

export async function readDb(): Promise<Database> {
  const row = await readRow();
  return row.payload;
}

async function tryWrite(row: StoreRow, payload: Database) {
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
