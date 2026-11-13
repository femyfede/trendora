import fs from "fs/promises";
import path from "path";
import type { Database } from "./types";
import { seedDatabase } from "./seed";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "store.json");

const seed = seedDatabase();

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
    return;
  } catch {
    // Ignore: the file may not exist yet (e.g. fresh deploy).
  }
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(seed, null, 2), "utf8");
  } catch {
    // Read-only filesystem (e.g. Vercel): fall back to in-memory seed.
  }
}

export async function readDb(): Promise<Database> {
  await ensureDb();
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw) as Database;
  } catch {
    return seed;
  }
}

async function writeDb(db: Database) {
  await ensureDb();
  try {
    const tmp = `${DB_PATH}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, DB_PATH);
  } catch {
    // Writes don't persist on read-only filesystems; ignore.
  }
}

let queue: Promise<unknown> = Promise.resolve();

export function mutateDb<T>(mutator: (db: Database) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDb();
    const result = await mutator(db);
    await writeDb(db);
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run as Promise<T>;
}
