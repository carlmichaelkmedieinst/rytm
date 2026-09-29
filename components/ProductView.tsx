"use client";

import { useState } from "react";
import { EXERCISES, exerciseLabel } from "@/lib/exercises";
import {
  comparisonDelta,
  comparisonPair,
  formatSet,
  frequencyLabel,
  latestEntry,
} from "@/lib/format";
import { t, type Locale, type MessageKey } from "@/lib/i18n";
import type { Frequency, Snapshot, WorkoutInput } from "@/lib/types";

const FREQUENCIES: Frequency[] = [2, 3, 4, 5];

export function ProductView({
  snapshot,
  screen,
  busy,
  locale,
  onSelectFrequency,
  onSaveWorkout,
  onStartNext,
}: {
  snapshot: Snapshot;
  screen: "onboarding" | "log" | "first-saved" | "later-saved" | "comparison";
  busy: boolean;
  locale: Locale;
  onSelectFrequency: (frequency: Frequency) => void;
  onSaveWorkout: (input: WorkoutInput) => void;
  onStartNext: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4.75rem)] w-full max-w-3xl flex-col justify-center px-[clamp(1.25rem,4vw,4.5rem)] py-12">
      {screen === "onboarding" ? (
        <Onboarding locale={locale} busy={busy} onSelectFrequency={onSelectFrequency} />
      ) : null}
      {screen === "log" ? (
        <WorkoutLog
          locale={locale}
          snapshot={snapshot}
          busy={busy}
          onSaveWorkout={onSaveWorkout}
        />
      ) : null}
      {screen === "first-saved" ? (
        <FirstSaved locale={locale} snapshot={snapshot} busy={busy} onStartNext={onStartNext} />
      ) : null}
      {screen === "later-saved" ? (
        <LaterSaved locale={locale} snapshot={snapshot} busy={busy} onStartNext={onStartNext} />
      ) : null}
      {screen === "comparison" ? <Comparison locale={locale} snapshot={snapshot} /> : null}
    </main>
  );
}

function Onboarding({
  locale,
  busy,
  onSelectFrequency,
}: {
  locale: Locale;
  busy: boolean;
  onSelectFrequency: (frequency: Frequency) => void;
}) {
  return (
    <section className="max-w-xl">
      <h1 className="font-serif text-[clamp(3.25rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.03em]">
        {t(locale, "headlineLine1")}
        <br />
        {t(locale, "headlineLine2")}
      </h1>
      <p className="mt-10 text-lg">{t(locale, "frequencyQuestion")}</p>
      <ul className="mt-8 border-t border-line">
        {FREQUENCIES.map((frequency) => (
          <li key={frequency} className="border-b border-line">
            <button
              type="button"
              disabled={busy}
              onClick={() => onSelectFrequency(frequency)}
              className="w-full cursor-pointer py-5 text-left text-lg transition-colors hover:bg-blush disabled:cursor-default disabled:opacity-50"
            >
              {frequencyLabel(frequency, locale)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function WorkoutLog({
  locale,
  snapshot,
  busy,
  onSaveWorkout,
}: {
  locale: Locale;
  snapshot: Snapshot;
  busy: boolean;
  onSaveWorkout: (input: WorkoutInput) => void;
}) {
  const isFirst = !snapshot.state.first_workout_completed;
  const [exerciseId, setExerciseId] = useState<string>("bench_press");
  const [weight, setWeight] = useState(() => defaultWeight("bench_press", snapshot, isFirst));
  const [reps, setReps] = useState(() => defaultReps("bench_press", snapshot, isFirst));
  const [formError, setFormError] = useState<MessageKey | null>(null);

  const exercise = EXERCISES.find((item) => item.id === exerciseId) ?? EXERCISES[0];
  const previous = latestEntry(snapshot.entries, exerciseId);

  function chooseExercise(nextId: string) {
    setExerciseId(nextId);
    setWeight(defaultWeight(nextId, snapshot, isFirst));
    setReps(defaultReps(nextId, snapshot, isFirst));
    setFormError(null);
  }

  function save() {
    const parsedWeight = Number(weight.replace(",", "."));
    const parsedReps = Number(reps);
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setFormError("enterWeight");
      return;
    }
    if (!Number.isInteger(parsedReps) || parsedReps <= 0) {
      setFormError("enterReps");
      return;
    }
    setFormError(null);
    onSaveWorkout({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      weight: parsedWeight,
      reps: parsedReps,
    });
  }

  return (
    <section className="max-w-xl">
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {EXERCISES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => chooseExercise(item.id)}
            className={`cursor-pointer pb-1 ${
              item.id === exerciseId ? "border-b border-rose text-ink" : "text-muted"
            }`}
          >
            {exerciseLabel(locale, item.id)}
          </button>
        ))}
      </div>
      <h1 className="mt-8 font-serif text-[clamp(3rem,5vw,4.75rem)] leading-none tracking-[-0.03em]">
        {exerciseLabel(locale, exercise.id)}
      </h1>
      {previous ? (
        <p className="mt-8 text-muted">
          {t(locale, "lastTime")}
          <span className="mt-1 block font-serif text-3xl text-ink">{formatSet(previous, locale)}</span>
        </p>
      ) : null}
      <div className="mt-10 grid grid-cols-2 gap-10">
        <label className="block">
          <span className="text-sm text-muted">{t(locale, "weight")}</span>
          <input
            inputMode="decimal"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            className="mt-2 w-full border-b border-line bg-transparent pb-2 font-serif text-4xl outline-none focus:border-rose"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">{t(locale, "reps")}</span>
          <input
            inputMode="numeric"
            value={reps}
            onChange={(event) => setReps(event.target.value)}
            className="mt-2 w-full border-b border-line bg-transparent pb-2 font-serif text-4xl outline-none focus:border-rose"
          />
        </label>
      </div>
      {formError ? <p className="mt-4 text-sm text-rose">{t(locale, formError)}</p> : null}
      <button
        type="button"
        disabled={busy}
        onClick={save}
        className="mt-12 cursor-pointer rounded-full bg-rose px-8 py-3 text-white disabled:cursor-default disabled:opacity-50"
      >
        {busy ? t(locale, "saving") : t(locale, "saveWorkout")}
      </button>
    </section>
  );
}

function FirstSaved({
  locale,
  snapshot,
  busy,
  onStartNext,
}: {
  locale: Locale;
  snapshot: Snapshot;
  busy: boolean;
  onStartNext: () => void;
}) {
  const latest = snapshot.entries[snapshot.entries.length - 1];
  const testGroup = snapshot.settings.experiment_group === "test";

  return (
    <section className="max-w-xl">
      {latest ? (
        <p className="text-sm tracking-[0.14em] text-muted">
          {exerciseLabel(locale, latest.exercise_id)} · {formatSet(latest, locale)}
        </p>
      ) : null}
      {testGroup ? (
        <>
          <h1 className="mt-8 font-serif text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] tracking-[-0.03em]">
            {t(locale, "firstPointSaved")}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            {t(locale, "firstPointNext")}
          </p>
        </>
      ) : (
        <h1 className="mt-8 font-serif text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] tracking-[-0.03em]">
          {t(locale, "workoutSaved")}
        </h1>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={onStartNext}
        className="mt-12 cursor-pointer rounded-full bg-rose px-8 py-3 text-white disabled:cursor-default disabled:opacity-50"
      >
        {t(locale, "startNewWorkout")}
      </button>
    </section>
  );
}

function LaterSaved({
  locale,
  snapshot,
  busy,
  onStartNext,
}: {
  locale: Locale;
  snapshot: Snapshot;
  busy: boolean;
  onStartNext: () => void;
}) {
  const latest = snapshot.entries[snapshot.entries.length - 1];

  return (
    <section className="max-w-xl">
      {latest ? (
        <>
          <h1 className="font-serif text-[clamp(3rem,5vw,4.75rem)] leading-none tracking-[-0.03em]">
            {exerciseLabel(locale, latest.exercise_id)}
          </h1>
          <p className="mt-6 font-serif text-4xl">{formatSet(latest, locale)}</p>
        </>
      ) : null}
      <p className="mt-8 text-lg">{t(locale, "workoutSaved")}</p>
      <button
        type="button"
        disabled={busy}
        onClick={onStartNext}
        className="mt-12 cursor-pointer rounded-full bg-rose px-8 py-3 text-white disabled:cursor-default disabled:opacity-50"
      >
        {t(locale, "startNewWorkout")}
      </button>
    </section>
  );
}

function Comparison({ locale, snapshot }: { locale: Locale; snapshot: Snapshot }) {
  const pair = comparisonPair(snapshot.entries);
  if (!pair) return null;
  const delta = comparisonDelta(pair.previous, pair.current, locale);

  return (
    <section>
      <h1 className="font-serif text-[clamp(3.5rem,6vw,6rem)] leading-none tracking-[-0.03em]">
        {exerciseLabel(locale, pair.current.exercise_id)}
      </h1>
      <div className="mt-12 grid gap-10 bg-blush px-6 py-10 sm:grid-cols-2 sm:gap-16 sm:px-12 sm:py-14">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-rose uppercase">{t(locale, "previous")}</p>
          <p className="mt-4 font-serif text-[clamp(2.4rem,4vw,4rem)] leading-none">
            {formatSet(pair.previous, locale)}
          </p>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.18em] text-rose uppercase">{t(locale, "now")}</p>
          <p className="mt-4 font-serif text-[clamp(2.4rem,4vw,4rem)] leading-none">
            {formatSet(pair.current, locale)}
          </p>
        </div>
      </div>
      {delta ? (
        <p className="mt-10 font-serif text-[clamp(2rem,3vw,3.25rem)] leading-tight tracking-[-0.03em] text-rose italic">
          {delta.headline}
          {delta.detail ? (
            <span className="mt-2 block font-sans text-lg text-muted not-italic">{delta.detail}</span>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}

function defaultWeight(exerciseId: string, snapshot: Snapshot, isFirst: boolean) {
  const previous = latestEntry(snapshot.entries, exerciseId);
  if (!isFirst && exerciseId === "bench_press" && previous) return "60";
  if (previous) return String(previous.weight);
  return "60";
}

function defaultReps(exerciseId: string, snapshot: Snapshot, isFirst: boolean) {
  const previous = latestEntry(snapshot.entries, exerciseId);
  if (!isFirst && exerciseId === "bench_press" && previous) return "10";
  if (previous) return String(previous.reps);
  return "8";
}
