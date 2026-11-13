import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from "crypto";
import { cookies } from "next/headers";
import { readDb, mutateDb } from "./db";
import type { User, UserRole } from "./types";

const SECRET = process.env.AUTH_SECRET || "trendora-local-dev-secret-change-me";
const SESSION_COOKIE = "trendora_session";
const ADMIN_COOKIE = "trendora_admin";
const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

function safeCompare(a: string, b: string) {
  const one = Buffer.from(a);
  const two = Buffer.from(b);
  if (one.length !== two.length) return false;
  return timingSafeEqual(one, two);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64).toString("hex");
  return safeCompare(candidate, hash);
}

export function createSessionToken(userId: string, role: UserRole) {
  const exp = Date.now() + SESSION_TTL;
  const payload = `u.${userId}.${role}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 5) return null;
  const [kind, userId, role, exp, signature] = parts;
  if (kind !== "u") return null;
  if (!safeCompare(sign(`${kind}.${userId}.${role}.${exp}`), signature)) return null;
  if (Number(exp) < Date.now()) return null;
  return { userId, role: role as UserRole };
}

export function createAdminToken() {
  const exp = Date.now() + SESSION_TTL;
  const payload = `a.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string | undefined | null) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [kind, exp, signature] = parts;
  if (kind !== "a") return null;
  if (!safeCompare(sign(`${kind}.${exp}`), signature)) return null;
  if (Number(exp) < Date.now()) return null;
  return true;
}

export function checkAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "trendora2026";
  return password.length === expected.length && safeCompare(password, expected);
}

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) return null;
  const db = await readDb();
  const user = db.users.find((u) => u.id === session.userId && u.isActive);
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}

export function isAdmin() {
  return verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value) === true;
}

export function hasRole(...roles: UserRole[]) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) return false;
  return roles.includes(session.role);
}

export function requireAuth(...roles: UserRole[]) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) return { authenticated: false, user: null, error: "Not authenticated" };
  if (roles.length > 0 && !roles.includes(session.role)) {
    return { authenticated: true, user: null, error: "Insufficient permissions" };
  }
  return { authenticated: true, user: session, error: null };
}

export { SESSION_COOKIE, ADMIN_COOKIE, SESSION_TTL };
