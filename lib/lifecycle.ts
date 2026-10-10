import type { AppEvent, Snapshot } from "@/lib/types";

export const DEMO_EMAIL = "demo@minrytm.se";
export const DEMO_SHARE_ID = "demo_share_001";

export type DemoSource = { qr_id: string; utm_content: string };

export const RYDEBACK_SOURCE: DemoSource = {
  qr_id: "rydeback_utegym",
  utm_content: "daligt_pass_bra_manad",
};

export const DEMO_PATH = `/demo?qr_id=${RYDEBACK_SOURCE.qr_id}&utm_content=${RYDEBACK_SOURCE.utm_content}`;

export const QR_LOCATIONS: Record<string, string> = {
  rydeback_utegym: "Rydebäck utegym",
};

export const CAMPAIGN_HEADLINES: Record<string, string> = {
  daligt_pass_bra_manad: "Dåligt pass. Bra månad.",
};

export const LIFECYCLE_STAGES = ["waitlist", "account_created", "awaiting_comparison", "activated"] as const;

export type LifecycleStatus = "visitor" | (typeof LIFECYCLE_STAGES)[number];

export type NextAction =
  | "wait_for_launch"
  | "wait_for_account"
  | "onboarding_help"
  | "wait_for_relevant_behavior"
  | "stop_activation_communication";

export const NEXT_ACTION_COPY: Record<NextAction, string> = {
  wait_for_launch: "Vänta på lansering. Ingen kommunikation innan dess.",
  wait_for_account: "Lanseringsnotisen är skickad. Vänta på att kontot skapas.",
  onboarding_help: "Hjälp användaren att logga sitt första pass.",
  wait_for_relevant_behavior:
    "Första passet är loggat, så ingen påminnelse om det. Vänta tills samma övning loggas igen.",
  stop_activation_communication: "Användaren har tagit steget. Aktiveringskommunikationen är stoppad.",
};

type EventCopy = {
  kind: "trigger" | "action";
  title: string;
  proposed: boolean;
  state?: string;
};

export const EVENT_COPY: Record<string, EventCopy> = {
  waitlist_signup: { kind: "trigger", proposed: true, title: "Skrev upp sig på väntelistan" },
  segment_assigned: { kind: "action", proposed: true, title: "Segment satt utifrån källa" },
  launch_notification_sent: { kind: "action", proposed: true, title: "Lanseringsnotis skickad (simulerad)" },
  account_created: { kind: "trigger", proposed: true, title: "Konto skapat och kopplat till väntelistan" },
  training_frequency_selected: { kind: "trigger", proposed: false, title: "Träningsfrekvens vald" },
  first_workout_completed: {
    kind: "trigger",
    proposed: false,
    title: "Första passet loggat",
    state: "user_state.first_workout_completed = true",
  },
  second_workout_completed: { kind: "trigger", proposed: false, title: "Pass loggat igen" },
  first_comparison_available: {
    kind: "trigger",
    proposed: false,
    title: "Första jämförelsen finns",
    state: "user_state.first_comparison_available = true",
  },
  activation_communication_stopped: {
    kind: "action",
    proposed: true,
    title: "Aktiveringskommunikation stoppad",
    state: "user_state.communication_active = false",
  },
  content_shared: { kind: "trigger", proposed: true, title: "Resultat delat (simulerat)" },
};

export type MaProfile = {
  email: string | null;
  qrId: string | null;
  utmContent: string | null;
  launchConsent: boolean | null;
  marketingConsent: boolean | null;
  segment: string | null;
  location: string | null;
  lifecycle: LifecycleStatus;
  nextAction: NextAction | null;
  launchNotified: boolean;
  accountCreated: boolean;
  firstWorkout: boolean;
  firstComparison: boolean;
  activationStopped: boolean;
  shareId: string | null;
  latestEvent: AppEvent | null;
  kpi: boolean;
};

function findEvent(events: AppEvent[], name: string) {
  return events.find((event) => event.event_name === name) ?? null;
}

function text(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function flag(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function lifecycleStatus(signedUp: boolean, accountCreated: boolean, snapshot: Snapshot): LifecycleStatus {
  if (!signedUp) return "visitor";
  if (!accountCreated) return "waitlist";
  if (snapshot.state.first_comparison_available) return "activated";
  if (snapshot.state.first_workout_completed) return "awaiting_comparison";
  return "account_created";
}

function nextActionFor(lifecycle: LifecycleStatus, launchNotified: boolean): NextAction | null {
  if (lifecycle === "waitlist") return launchNotified ? "wait_for_account" : "wait_for_launch";
  if (lifecycle === "account_created") return "onboarding_help";
  if (lifecycle === "awaiting_comparison") return "wait_for_relevant_behavior";
  if (lifecycle === "activated") return "stop_activation_communication";
  return null;
}

export function journeyEvents(events: AppEvent[]) {
  const start = events.findIndex((event) => event.event_name === "waitlist_signup");
  return start < 0 ? [] : events.slice(start);
}

export function maProfile(snapshot: Snapshot): MaProfile {
  const { state } = snapshot;
  const events = journeyEvents(snapshot.events);
  const signup = findEvent(events, "waitlist_signup")?.payload ?? null;
  const segment = findEvent(events, "segment_assigned")?.payload ?? null;
  const share = findEvent(events, "content_shared")?.payload ?? null;
  const accountCreated = Boolean(findEvent(events, "account_created"));
  const launchNotified = Boolean(findEvent(events, "launch_notification_sent"));
  const lifecycle = lifecycleStatus(Boolean(signup), accountCreated, snapshot);
  const demoEvents = events.filter((event) => event.event_name in EVENT_COPY);

  return {
    email: text(signup?.email),
    qrId: text(signup?.qr_id),
    utmContent: text(signup?.utm_content),
    launchConsent: flag(signup?.launch_notification_consent),
    marketingConsent: flag(signup?.marketing_consent),
    segment: text(segment?.source_segment),
    location: text(segment?.source_location),
    lifecycle,
    nextAction: nextActionFor(lifecycle, launchNotified),
    launchNotified,
    accountCreated,
    firstWorkout: accountCreated && state.first_workout_completed,
    firstComparison: accountCreated && state.first_comparison_available,
    activationStopped: Boolean(findEvent(events, "activation_communication_stopped")),
    shareId: text(share?.share_id),
    latestEvent: demoEvents[demoEvents.length - 1] ?? null,
    kpi: accountCreated && state.first_comparison_available,
  };
}

export function latestMovement(events: AppEvent[]) {
  const index = events.findLastIndex((event) => EVENT_COPY[event.event_name]?.kind === "trigger");
  if (index < 0) return null;
  return {
    trigger: events[index],
    actions: events.slice(index + 1).filter((event) => EVENT_COPY[event.event_name]?.kind === "action"),
  };
}

export function eventTag(eventName: string) {
  const copy = EVENT_COPY[eventName];
  if (!copy) return "Prototyp-event";
  return copy.proposed ? "Demo-event · föreslagen modell" : "Prototyp-event";
}
