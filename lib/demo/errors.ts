const MESSAGES = {
  not_authenticated: "Anonym session saknas",
  stale_generation: "Demonstrationen har nollställts. Starta om resan.",
  invalid_qr: "Ogiltig QR-källa",
  invalid_email: "Ange bara namnet före @rytm.test",
  consent_required: "Samtycke till lanseringsnotis krävs",
  invalid_transition: "Det steget är inte tillgängligt ännu",
  invalid_token: "Den simulerade kopplingen stämmer inte",
  email_taken: "Den fiktiva adressen används redan i den här demonstrationen",
  participant_not_found: "Deltagaren finns inte i den här demonstrationens omgång",
  unauthorized: "Saknar behörighet",
  not_configured: "Backstage är inte konfigurerat",
  invalid_visit_key: "Ogiltigt besöks-id",
  invalid_step: "Ogiltigt pass",
  invalid_body: "Ofullständig begäran",
  payload_rejected: "Händelsen avvisades",
  forbidden: "Åtgärden är inte tillåten",
  failed: "Demonstrationen kunde inte sparas",
} as const;

export type DemoErrorCode = keyof typeof MESSAGES;

const CODE_LIST = Object.keys(MESSAGES) as DemoErrorCode[];

export function demoMessage(code: DemoErrorCode) {
  return MESSAGES[code];
}

export function matchDemoError(message: string): DemoErrorCode | null {
  return CODE_LIST.find((code) => message === code || message.endsWith(` ${code}`) || message.includes(code)) ?? null;
}

export function demoStatus(code: DemoErrorCode) {
  if (code === "not_authenticated" || code === "unauthorized") return 401;
  if (code === "forbidden" || code === "invalid_token") return 403;
  if (code === "participant_not_found") return 404;
  if (code === "not_configured") return 503;
  if (
    code === "stale_generation" ||
    code === "invalid_transition" ||
    code === "email_taken"
  ) {
    return 409;
  }
  if (code === "failed" || code === "payload_rejected") return 500;
  return 400;
}
