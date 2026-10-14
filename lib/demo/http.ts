import { timingSafeEqual } from "crypto";
import { demoMessage, demoStatus, type DemoErrorCode } from "@/lib/demo/errors";
import { DemoRpcError, anonDemoClient, callDemoRpc, userDemoClient } from "@/lib/demo/rpc";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function demoJson(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export function demoError(code: DemoErrorCode) {
  return demoJson({ error: code, message: demoMessage(code) }, demoStatus(code));
}

export function bearerToken(request: Request) {
  const match = (request.headers.get("authorization") ?? "").match(/^Bearer\s+(\S+)$/i);
  return match?.[1] ?? null;
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export async function readObject(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function withUser(
  request: Request,
  fn: string,
  args: Record<string, unknown> | null,
) {
  if (!args) return demoError("invalid_body");
  const token = bearerToken(request);
  if (!token) return demoError("not_authenticated");
  try {
    const data = await callDemoRpc(userDemoClient(token), fn, args);
    return demoJson(data);
  } catch (error) {
    if (error instanceof DemoRpcError) return demoError(error.code);
    console.error(fn, error);
    return demoError("failed");
  }
}

function presenterSecret() {
  const secret = process.env.DEMO_ACCESS_SECRET ?? "";
  return secret.length >= 24 ? secret : null;
}

function secretMatches(provided: string | null, expected: string) {
  if (!provided) return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function withPresenter(request: Request, fn: "demo_backstage" | "demo_reset_generation") {
  const secret = presenterSecret();
  if (!secret) return demoError("not_configured");
  if (!secretMatches(request.headers.get("x-demo-access"), secret)) return demoError("unauthorized");
  try {
    const data = await callDemoRpc(anonDemoClient(), fn, { p_secret: secret });
    return demoJson(data);
  } catch (error) {
    if (error instanceof DemoRpcError) return demoError(error.code);
    console.error(fn, error);
    return demoError("failed");
  }
}
