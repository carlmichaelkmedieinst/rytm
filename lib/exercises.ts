export const EXERCISES = [
  { id: "bench_press", name: "Bänkpress" },
  { id: "squat", name: "Knäböj" },
  { id: "deadlift", name: "Marklyft" },
] as const;

export type ExerciseId = (typeof EXERCISES)[number]["id"];

export function exerciseName(exerciseId: string) {
  return EXERCISES.find((exercise) => exercise.id === exerciseId)?.name ?? exerciseId;
}
