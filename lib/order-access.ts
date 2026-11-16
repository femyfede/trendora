import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function createOrderAccessToken() {
  return randomBytes(32).toString("base64url");
}

export function hashOrderAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyOrderAccessToken(token: string | null, expectedHash?: string) {
  if (!token || !expectedHash) return false;
  const actual = Buffer.from(hashOrderAccessToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
