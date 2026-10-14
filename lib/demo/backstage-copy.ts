import { sourceLabel } from "@/lib/demo/source";

export const LIFECYCLE_LABEL: Record<string, string> = {
  visitor: "Besökare",
  waitlist: "Väntelista",
  account_created: "Konto skapat",
  awaiting_comparison: "Väntar på jämförelse",
  activated: "Aktiverad",
};

const EVENT_TITLE: Record<string, string> = {
  demo_visit: "Besök",
  waitlist_signup: "Väntelisteanmälan",
  segment_assigned: "Segment satt",
  launch_notification_sent: "Lanseringsbesked",
  account_created: "Konto skapat",
  first_workout_completed: "Första passet",
  first_comparison_available: "Första jämförelsen",
  activation_communication_stopped: "Aktiveringskommunikation stoppad",
};

const EVENT_ROLE: Record<string, string> = {
  demo_visit: "Deltagare",
  waitlist_signup: "Deltagare",
  segment_assigned: "Automation",
  launch_notification_sent: "Automation",
  account_created: "Deltagare",
  first_workout_completed: "Produkt",
  first_comparison_available: "Produkt",
  activation_communication_stopped: "Automation",
};

export type DemoEvent = {
  event_id: string;
  event_name: string;
  event_kind: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type DemoParticipant = {
  participant_id: string;
  qr_id: string;
  lifecycle_status: string;
  fictional_email: string | null;
  created_at: string;
  updated_at: string;
  latest_event: { event_name: string; event_kind: string; created_at: string } | null;
  events: DemoEvent[];
};

export function lifecycleLabel(status: string) {
  return LIFECYCLE_LABEL[status] ?? status;
}

export function eventTitle(name: string) {
  return EVENT_TITLE[name] ?? name;
}

export function eventRole(name: string) {
  return EVENT_ROLE[name] ?? "Händelse";
}

function text(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value ? value : null;
}

function flag(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "boolean" ? value : null;
}

export function eventDetail(event: DemoEvent) {
  const payload = event.payload ?? {};
  if (event.event_name === "demo_visit") {
    const qr = text(payload, "qr_id");
    return qr ? `Källa: ${sourceLabel(qr)}` : null;
  }
  if (event.event_name === "waitlist_signup") {
    const consent = flag(payload, "launch_notification_consent");
    const qr = text(payload, "qr_id");
    const parts = [];
    if (consent === true) parts.push("Samtycke till lanseringsbesked: ja");
    if (consent === false) parts.push("Samtycke till lanseringsbesked: nej");
    if (qr) parts.push(`Källa: ${sourceLabel(qr)}`);
    return parts.join(" · ") || null;
  }
  if (event.event_name === "segment_assigned") {
    const segment = text(payload, "source_segment");
    const location = text(payload, "source_location");
    const qr = text(payload, "qr_id");
    const parts = [];
    if (segment) parts.push(`Segment: ${segment === "platsbunden_qr" ? "Platsbunden QR" : segment}`);
    if (location) parts.push(location);
    if (qr) parts.push(`Källa: ${sourceLabel(qr)}`);
    return parts.join(" · ") || null;
  }
  if (event.event_name === "launch_notification_sent") {
    return payload.simulated === true ? "Simulerat besked. Ingen riktig e-post skickades." : null;
  }
  if (event.event_name === "account_created") {
    if (text(payload, "linking") === "simulated_registration_token") {
      return "Väntelistan kopplades till kontot via den simulerade registreringstoken.";
    }
    return "Väntelistan och kontot är kopplade.";
  }
  if (event.event_name === "first_workout_completed") {
    return "Simulerat pass. Det här är en produkthändelse, inte en automatisering.";
  }
  if (event.event_name === "first_comparison_available") {
    return "Produkten registrerade att den första jämförelsen finns.";
  }
  if (event.event_name === "activation_communication_stopped" && text(payload, "reason") === "first_comparison_available") {
    return "Aktiveringsvillkoret är uppfyllt, så aktiveringskommunikationen stoppas.";
  }
  return null;
}

export function decisionNote(previous: DemoEvent | null, event: DemoEvent) {
  if (!previous) return null;
  if (previous.event_name === "waitlist_signup" && event.event_name === "segment_assigned") {
    const consent = flag(previous.payload ?? {}, "launch_notification_consent");
    const qr = text(previous.payload ?? {}, "qr_id");
    if (consent !== true || !qr) return null;
    return "Anmälan innehåller samtycke och källa. Automationen satte segmentet utifrån den källan.";
  }
  if (previous.event_name === "first_comparison_available" && event.event_name === "activation_communication_stopped") {
    return "Jämförelsen är en produkthändelse. När den finns är aktiveringsvillkoret uppfyllt och automationen stoppar aktiveringskommunikationen.";
  }
  return null;
}

export function blueprintFor(participant: DemoParticipant) {
  const names = new Set(participant.events.map((event) => event.event_name));
  const status = participant.lifecycle_status;
  if (status === "activated" && names.has("first_comparison_available") && names.has("activation_communication_stopped")) {
    return {
      front: "Deltagaren såg den illustrerade jämförelsen och att resan är aktiverad.",
      back: "Systemet registrerade jämförelsen och stoppade aktiveringskommunikationen.",
      data: "first_comparison_available · activation_communication_stopped",
    };
  }
  if (status === "awaiting_comparison" && names.has("first_workout_completed")) {
    return {
      front: "Deltagaren simulerade sitt första pass.",
      back: "Produkten sparade passet. Aktivering kräver även nästa pass och en jämförelse.",
      data: "first_workout_completed · lifecycle_status = awaiting_comparison",
    };
  }
  if (status === "account_created" && names.has("account_created")) {
    return {
      front: "Deltagaren skapade ett konto.",
      back: "Väntelisteanmälan kopplades till det nya kontot.",
      data: "account_created",
    };
  }
  if (names.has("launch_notification_sent")) {
    return {
      front: "Deltagaren såg det simulerade lanseringsbeskedet.",
      back: "Automationen registrerade att beskedet skickats i demonstrationen.",
      data: "launch_notification_sent",
    };
  }
  if (names.has("waitlist_signup")) {
    return {
      front: "Deltagaren gick med på väntelistan med en påhittad e-postadress.",
      back: names.has("segment_assigned")
        ? "Anmälan sparades och ett segment sattes från källan."
        : "Anmälan sparades.",
      data: names.has("segment_assigned") ? "waitlist_signup · segment_assigned" : "waitlist_signup",
    };
  }
  if (names.has("demo_visit")) {
    return {
      front: "Deltagaren öppnade resan.",
      back: "Besöket sparades med källa och tidpunkt.",
      data: "demo_visit",
    };
  }
  return {
    front: "Deltagaren har inte genomfört något steg ännu.",
    back: "Ingen händelse är sparad.",
    data: "—",
  };
}

export function activityTime(participant: DemoParticipant) {
  return participant.latest_event?.created_at ?? participant.updated_at ?? participant.created_at;
}
