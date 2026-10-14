import { getSupabase } from "@/lib/supabase/client";

const GENERATION_KEY = "rytm-demo-generation";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class DemoClientError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function isStaleGeneration(error: unknown) {
  return error instanceof DemoClientError && error.code === "stale_generation";
}

export function readStoredGeneration() {
  const value = sessionStorage.getItem(GENERATION_KEY);
  return value && UUID.test(value) ? value : null;
}

export function writeStoredGeneration(generationId: string) {
  sessionStorage.setItem(GENERATION_KEY, generationId);
}

export function clearStoredGeneration() {
  sessionStorage.removeItem(GENERATION_KEY);
  clearHeldRegistrationToken();
}

let heldRegistration: { generationId: string; token: string } | null = null;

function holdRegistrationToken(generationId: string, token: string) {
  heldRegistration = { generationId, token };
}

export function clearHeldRegistrationToken() {
  heldRegistration = null;
}

function heldRegistrationToken(generationId: string) {
  return heldRegistration?.generationId === generationId ? heldRegistration.token : null;
}

export function userFacingError(error: unknown) {
  if (error instanceof DemoClientError) return error.message;
  if (error instanceof TypeError) return "Anslutningen avbröts. Försök igen.";
  if (error instanceof Error && error.message.includes("Supabase-miljövariabler")) {
    return "Demonstrationen är inte konfigurerad.";
  }
  if (error instanceof Error && error.message.toLowerCase().includes("anonymous")) {
    return "Anonym inloggning är inte aktiverad för demonstrationen.";
  }
  return "Demonstrationen kunde inte sparas. Försök igen.";
}

function publicPayload(payload: Record<string, unknown>) {
  const next = { ...payload };
  delete next.registration_token;
  return next;
}

async function demoRequest(
  path: string,
  token: string | null,
  body?: Record<string, unknown>,
  options?: { keepRegistrationToken?: boolean },
) {
  let response: Response;
  try {
    response = await fetch(path, {
      method: body ? "POST" : "GET",
      headers: {
        ...(body ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof TypeError) throw error;
    throw new DemoClientError("failed", "Demonstrationen kunde inte sparas. Försök igen.");
  }

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok) {
    const code = typeof payload?.error === "string" ? payload.error : "failed";
    const message =
      typeof payload?.message === "string" ? payload.message : "Demonstrationen kunde inte sparas. Försök igen.";
    throw new DemoClientError(code, message);
  }
  const data = payload ?? {};
  return options?.keepRegistrationToken ? data : publicPayload(data);
}

let pendingAccessToken: Promise<string> | null = null;

async function acquireAccessToken() {
  const supabase = getSupabase();
  const existing = await supabase.auth.getSession();
  if (existing.error) throw new DemoClientError("not_authenticated", "Anonym session kunde inte startas.");
  if (existing.data.session?.access_token) return existing.data.session.access_token;

  const signedIn = await supabase.auth.signInAnonymously();
  if (signedIn.error || !signedIn.data.session?.access_token) {
    const detail = signedIn.error?.message ?? "";
    if (detail.toLowerCase().includes("anonymous")) {
      throw new DemoClientError("not_authenticated", "Anonym inloggning är inte aktiverad för demonstrationen.");
    }
    throw new DemoClientError("not_authenticated", "Anonym session kunde inte startas.");
  }
  return signedIn.data.session.access_token;
}

export function demoAccessToken() {
  if (!pendingAccessToken) {
    pendingAccessToken = acquireAccessToken().finally(() => {
      pendingAccessToken = null;
    });
  }
  return pendingAccessToken;
}

export async function fetchGeneration() {
  const payload = await demoRequest("/api/demo/generation", null);
  const generationId = payload.generation_id;
  if (typeof generationId !== "string" || !UUID.test(generationId)) {
    throw new DemoClientError("failed", "Demonstrationen kunde inte startas.");
  }
  return generationId;
}

export async function ensureParticipant(token: string, generationId: string, qrId: string) {
  return demoRequest("/api/demo/participants", token, { generation_id: generationId, qr_id: qrId });
}

export async function registerVisit(token: string, generationId: string, qrId: string, visitKey: string) {
  return demoRequest("/api/demo/visits", token, {
    generation_id: generationId,
    qr_id: qrId,
    client_visit_key: visitKey,
  });
}

export async function joinWaitlist(
  token: string,
  generationId: string,
  localPart: string,
  launchConsent: boolean,
) {
  const payload = await demoRequest(
    "/api/demo/waitlist",
    token,
    {
      generation_id: generationId,
      local_part: localPart,
      launch_consent: launchConsent,
      marketing_consent: false,
    },
    { keepRegistrationToken: true },
  );
  const registration = payload.registration_token;
  if (typeof registration === "string" && registration) holdRegistrationToken(generationId, registration);
  return publicPayload(payload);
}

export async function simulateLaunch(token: string, generationId: string) {
  return demoRequest("/api/demo/launch", token, { generation_id: generationId });
}

async function pullRegistrationToken(token: string, generationId: string) {
  const held = heldRegistrationToken(generationId);
  if (held) return held;
  const payload = await demoRequest(
    "/api/demo/registration",
    token,
    { generation_id: generationId },
    { keepRegistrationToken: true },
  );
  const registration = payload.registration_token;
  if (payload.available === true && typeof registration === "string" && registration) {
    holdRegistrationToken(generationId, registration);
    return registration;
  }
  return null;
}

export async function createAccount(token: string, generationId: string) {
  const registration = await pullRegistrationToken(token, generationId);
  if (!registration) {
    throw new DemoClientError("invalid_token", "Den simulerade kopplingen kunde inte återställas.");
  }
  const payload = await demoRequest("/api/demo/account", token, {
    generation_id: generationId,
    registration_token: registration,
  });
  clearHeldRegistrationToken();
  return payload;
}

export async function registerWorkout(token: string, generationId: string, step: "first" | "second") {
  return demoRequest("/api/demo/workouts", token, { generation_id: generationId, step });
}

export async function fetchTimeline(token: string, generationId: string) {
  return demoRequest(`/api/demo/timeline?generation_id=${generationId}`, token);
}
