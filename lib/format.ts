import { t, tf, type Locale } from "@/lib/i18n";
import type { Snapshot, UserState, WorkoutEntry } from "@/lib/types";

export function formatWeight(value: number, locale: Locale = "sv") {
  if (Number.isInteger(value)) return String(value);
  return value.toLocaleString(locale === "sv" ? "sv-SE" : "en-GB", { maximumFractionDigits: 2 });
}

export function formatSet(entry: Pick<WorkoutEntry, "weight" | "reps">, locale: Locale = "sv") {
  return `${formatWeight(entry.weight, locale)} kg × ${entry.reps}`;
}

export function frequencyLabel(frequency: number | null, locale: Locale = "sv") {
  if (frequency == null) return t(locale, "notSelected");
  if (frequency >= 5) return t(locale, "frequency5");
  return tf(locale, "frequencyN", { count: frequency });
}

export function yesNo(value: boolean, locale: Locale = "sv") {
  return value ? t(locale, "yes") : t(locale, "no");
}

export function dash(value: number | null | boolean, locale: Locale = "sv") {
  if (value == null) return "—";
  if (typeof value === "boolean") return yesNo(value, locale);
  return String(value);
}

export function shortenId(userId: string) {
  return userId.slice(0, 8);
}

export function latestEntry(entries: WorkoutEntry[], exerciseId: string) {
  return [...entries]
    .reverse()
    .find((entry) => entry.exercise_id === exerciseId) ?? null;
}

export function comparisonPair(entries: WorkoutEntry[]) {
  const sorted = [...entries].sort((a, b) => a.created_at.localeCompare(b.created_at));
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const current = sorted[index];
    const previous = sorted
      .slice(0, index)
      .reverse()
      .find((entry) => entry.exercise_id === current.exercise_id);
    if (previous) return { previous, current };
  }
  return null;
}

export function comparisonDelta(
  previous: WorkoutEntry,
  current: WorkoutEntry,
  locale: Locale = "sv",
) {
  const weightDelta = Math.round((current.weight - previous.weight) * 100) / 100;
  const repsDelta = current.reps - previous.reps;

  if (weightDelta === 0 && repsDelta !== 0) {
    const sign = repsDelta > 0 ? "+" : "−";
    return {
      headline: `${sign}${Math.abs(repsDelta)} reps`,
      detail: t(locale, "sameWeight"),
    };
  }

  if (repsDelta === 0 && weightDelta !== 0) {
    const sign = weightDelta > 0 ? "+" : "−";
    return {
      headline: `${sign}${formatWeight(Math.abs(weightDelta), locale)} kg`,
      detail: t(locale, "sameReps"),
    };
  }

  if (weightDelta === 0 && repsDelta === 0) {
    return {
      headline: t(locale, "sameResult"),
      detail: "",
    };
  }

  return null;
}

export type KpiStatus = "pending" | "achieved" | "missed";

export function kpiStatus(state: UserState): KpiStatus {
  const achieved =
    state.kpi_success === true ||
    (state.first_comparison_available &&
      state.comparison_day != null &&
      state.comparison_day <= 14);

  if (achieved) return "achieved";
  if (state.kpi_success === false) return "missed";
  if (state.current_day >= 14 && !state.first_comparison_available) return "missed";
  return "pending";
}

export type ProductScreen = "onboarding" | "log" | "first-saved" | "later-saved" | "comparison";

export function productScreen(snapshot: Snapshot, intent: "idle" | "log"): ProductScreen {
  if (intent === "log" && snapshot.settings.training_frequency) return "log";
  if (snapshot.state.first_comparison_available) return "comparison";
  if (!snapshot.settings.training_frequency) return "onboarding";
  if (!snapshot.state.first_workout_completed) return "log";
  if (!snapshot.state.user_returned) return "first-saved";
  if (snapshot.workouts.length >= 2) return "later-saved";
  return "log";
}

export function formatPayload(payload: Record<string, unknown>) {
  const parts = Object.entries(payload).map(([key, value]) => `${key}: ${String(value)}`);
  return parts.join(" · ");
}

export function demoHasProgress(snapshot: Snapshot) {
  return (
    snapshot.settings.training_frequency != null ||
    snapshot.settings.notification_permission === false ||
    snapshot.state.current_day > 0 ||
    snapshot.state.first_workout_completed ||
    snapshot.workouts.length > 0 ||
    snapshot.events.length > 0
  );
}

export function activeWindow(day: number) {
  if (day >= 14) return "final";
  if (day >= 7) return "observe";
  return "communicate";
}
