import { demoError, demoJson, presenterSecret, readObject, sameOriginMutation, secretMatches } from "@/lib/demo/http";
import {
  clearPresenterCookieHeader,
  presenterCookieHeader,
  presenterCookieSecure,
  signPresenterSession,
} from "@/lib/demo/presenter-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOriginMutation(request)) return demoError("forbidden");
  const secret = presenterSecret();
  if (!secret) return demoError("not_configured");
  const body = await readObject(request);
  const code = typeof body?.code === "string" ? body.code : "";
  if (!secretMatches(code, secret)) return demoError("unauthorized");

  const response = demoJson({ ok: true });
  response.headers.set(
    "set-cookie",
    presenterCookieHeader(signPresenterSession(secret), presenterCookieSecure(request)),
  );
  return response;
}

export async function DELETE(request: Request) {
  if (!sameOriginMutation(request)) return demoError("forbidden");
  const response = demoJson({ ok: true });
  response.headers.set("set-cookie", clearPresenterCookieHeader(presenterCookieSecure(request)));
  return response;
}
