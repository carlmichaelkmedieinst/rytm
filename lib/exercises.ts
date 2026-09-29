import type { Locale } from "@/lib/i18n";

export const EXERCISES = [
  { id: "bench_press", name: "Bänkpress" },
  { id: "squat", name: "Knäböj" },
  { id: "deadlift", name: "Marklyft" },
] as const;

export type ExerciseId = (typeof EXERCISES)[number]["id"];

const exerciseLabels: Record<Locale, Record<ExerciseId, string>> = {
  sv: {
    bench_press: "Bänkpress",
    squat: "Knäböj",
    deadlift: "Marklyft",
  },
  en: {
    bench_press: "Bench Press",
    squat: "Squat",
    deadlift: "Deadlift",
  },
};

export function exerciseName(exerciseId: string) {
  return EXERCISES.find((exercise) => exercise.id === exerciseId)?.name ?? exerciseId;
}

export function exerciseLabel(locale: Locale, exerciseId: string) {
  if (exerciseId in exerciseLabels[locale]) {
    return exerciseLabels[locale][exerciseId as ExerciseId];
  }
  return exerciseId;
}
