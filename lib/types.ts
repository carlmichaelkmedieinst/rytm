export type ExperimentGroup = "test" | "control";
export type Frequency = 2 | 3 | 4 | 5;

export type UserSettings = {
  user_id: string;
  training_frequency: Frequency | null;
  notification_permission: boolean;
  experiment_group: ExperimentGroup;
};

export type UserState = {
  user_id: string;
  current_day: number;
  first_workout_completed: boolean;
  first_comparison_available: boolean;
  expected_next_workout_at: number | null;
  communication_active: boolean;
  measurement_active: boolean;
  push_sent: boolean;
  user_returned: boolean;
  comparison_day: number | null;
  kpi_success: boolean | null;
};

export type Workout = {
  id: string;
  user_id: string;
  simulated_day: number;
  created_at: string;
};

export type WorkoutEntry = {
  id: string;
  workout_id: string;
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  weight: number;
  reps: number;
  created_at: string;
};

export type AppEvent = {
  id: string;
  user_id: string;
  simulated_day: number;
  event_name: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type Snapshot = {
  userId: string;
  settings: UserSettings;
  state: UserState;
  workouts: Workout[];
  entries: WorkoutEntry[];
  events: AppEvent[];
};

export type WorkoutInput = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
};
