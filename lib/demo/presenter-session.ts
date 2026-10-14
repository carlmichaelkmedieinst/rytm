import { createHmac, timingSafeEqual } from "crypto";

export const PRESENTER_COOKIE = "rytm_demo_presenter";
export const PRESENTER_MAX_AGE = 60 * 60 * 8;

export function signPresenterSession(secret: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ exp: now + PRESENTER_MAX_AGE * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function presenterSessionValid(token: string | null, secret: string, now = Date.now()) {
  if (!token) return false;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  try {
    const body = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp?: unknown };
    return typeof body.exp === "number" && body.exp > now;
  } catch {
    return false;
  }
}

export function readPresenterCookie(request: Request) {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${PRESENTER_COOKIE}=`)) continue;
    return decodeURIComponent(trimmed.slice(PRESENTER_COOKIE.length + 1));
  }
  return null;
}

export function presenterCookieSecure(request: Request) {
  if (process.env.NODE_ENV === "production") return true;
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0]?.trim() === "https";
  return new URL(request.url).protocol === "https:";
}

export function presenterCookieHeader(token: string, secure: boolean) {
  return [
    `${PRESENTER_COOKIE}=${token}`,
    "HttpOnly",
    "Path=/api/demo",
    "SameSite=Lax",
    `Max-Age=${PRESENTER_MAX_AGE}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearPresenterCookieHeader(secure: boolean) {
  return [
    `${PRESENTER_COOKIE}=`,
    "HttpOnly",
    "Path=/api/demo",
    "SameSite=Lax",
    "Max-Age=0",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}
