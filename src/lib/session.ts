import "server-only";

import { createHmac } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "handcrafted-haven-session";

export type SessionPayload = {
  userId: string;
};

function getSessionSecret() {
  const secret =
    process.env.SESSION_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.DATABASE_URL;

  if (!secret) {
    throw new Error("SESSION_SECRET, AUTH_SECRET, or DATABASE_URL must be set.");
  }

  return secret;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function encodeSession(payload: SessionPayload) {
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function decodeSession(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || sign(encodedPayload) !== signature) {
    return null;
  }

  try {
    return JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function readSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return decodeSession(token);
}
