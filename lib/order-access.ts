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

/**
 * Whether a viewer may see an order: the admin, the signed-in owner of the order,
 * or anyone holding the order's private access token. Guest orders have no userId,
 * so ownership must only match when both ids are present.
 */
export function canViewOrder(
  order: { userId?: string; accessTokenHash?: string },
  viewer: { admin: boolean; userId?: string | null; accessToken?: string | null }
) {
  if (viewer.admin) return true;
  if (order.userId && viewer.userId && order.userId === viewer.userId) return true;
  return verifyOrderAccessToken(viewer.accessToken ?? null, order.accessTokenHash);
}
