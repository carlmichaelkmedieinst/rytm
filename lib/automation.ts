import { QR_LOCATIONS } from "@/lib/lifecycle";
import type { AppEvent, UserSettings, UserState } from "@/lib/types";

export type PlannedEvent = {
  event_name: string;
  payload: Record<string, unknown>;
};

export type AutomationPlan = {
  statePatch: Partial<UserState>;
  events: PlannedEvent[];
};

type AutomationInput = {
  settings: UserSettings;
  state: UserState;
  existingEvents: Set<string>;
};

export function daysUntilNextWorkout(frequency: UserSettings["training_frequency"]) {
  if (frequency === 2) return 3;
  if (frequency === 3) return 2;
  if (frequency === 4 || frequency === 5) return 1;
  return null;
}

export function planAutomation({
  settings,
  state,
  existingEvents,
}: AutomationInput): AutomationPlan {
  const patch: Partial<UserState> = {};
  const events: PlannedEvent[] = [];
  let communicationActive = state.communication_active;

  if (state.first_comparison_available && communicationActive) {
    communicationActive = false;
    patch.communication_active = false;
  }

  const expected = state.expected_next_workout_at;
  const pushAlready = state.push_sent || existingEvents.has("push_sent");
  const canPush =
    settings.experiment_group === "test" &&
    expected != null &&
    state.current_day >= expected &&
    !state.user_returned &&
    settings.notification_permission &&
    state.current_day <= 7 &&
    !state.first_comparison_available;

  if (canPush && !pushAlready) {
    patch.push_sent = true;
    events.push({ event_name: "push_sent", payload: {} });
  } else if (!state.push_sent && existingEvents.has("push_sent")) {
    patch.push_sent = true;
  }

  if (
    state.current_day >= 7 &&
    communicationActive &&
    !existingEvents.has("communication_stopped")
  ) {
    communicationActive = false;
    patch.communication_active = false;
    events.push({ event_name: "communication_stopped", payload: {} });
  } else if (existingEvents.has("communication_stopped") && communicationActive) {
    communicationActive = false;
    patch.communication_active = false;
  }

  if (state.current_day >= 14 && !existingEvents.has("measurement_completed")) {
    const kpiSuccess = state.first_comparison_available || state.kpi_success === true;
    patch.kpi_success = kpiSuccess;
    patch.measurement_active = false;
    events.push({
      event_name: "measurement_completed",
      payload: { kpi_success: kpiSuccess },
    });
  } else if (existingEvents.has("measurement_completed") && state.measurement_active) {
    patch.measurement_active = false;
    if (state.kpi_success == null) {
      patch.kpi_success = state.first_comparison_available;
    }
  }

  return { statePatch: patch, events };
}

export function sourceSegment(qrId: string) {
  const location = QR_LOCATIONS[qrId];
  return location
    ? { source_segment: "platsbunden_qr", source_location: location }
    : { source_segment: "platsbunden_qr" };
}

export function planLifecycleAutomation({
  events,
  state,
}: {
  events: AppEvent[];
  state: UserState;
}): AutomationPlan {
  const names = new Set(events.map((event) => event.event_name));
  const signup = events.find((event) => event.event_name === "waitlist_signup");
  const patch: Partial<UserState> = {};
  const planned: PlannedEvent[] = [];

  if (signup && !names.has("segment_assigned")) {
    planned.push({
      event_name: "segment_assigned",
      payload: sourceSegment(String(signup.payload.qr_id ?? "")),
    });
  }

  if (
    names.has("account_created") &&
    state.first_comparison_available &&
    !names.has("activation_communication_stopped")
  ) {
    patch.communication_active = false;
    planned.push({
      event_name: "activation_communication_stopped",
      payload: { reason: "first_comparison_available" },
    });
  }

  return { statePatch: patch, events: planned };
}
