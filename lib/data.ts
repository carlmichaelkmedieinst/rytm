import { daysUntilNextWorkout, planAutomation } from "@/lib/automation";
import { getSupabase } from "@/lib/supabase/client";
import type {
  AppEvent,
  ExperimentGroup,
  Frequency,
  Snapshot,
  UserSettings,
  UserState,
  Workout,
  WorkoutEntry,
  WorkoutInput,
} from "@/lib/types";

function assertOk(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function asFrequency(value: number | null): Frequency | null {
  if (value === 2 || value === 3 || value === 4 || value === 5) return value;
  return null;
}

function asGroup(value: string): ExperimentGroup {
  return value === "control" ? "control" : "test";
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function parseSettings(row: UserSettings): UserSettings {
  return {
    user_id: row.user_id,
    training_frequency: asFrequency(row.training_frequency),
    notification_permission: row.notification_permission,
    experiment_group: asGroup(row.experiment_group),
  };
}

function parseState(row: UserState): UserState {
  return {
    ...row,
    expected_next_workout_at: row.expected_next_workout_at,
    comparison_day: row.comparison_day,
    kpi_success: row.kpi_success,
  };
}

function parseEntry(row: WorkoutEntry): WorkoutEntry {
  return {
    ...row,
    weight: Number(row.weight),
    reps: Number(row.reps),
  };
}

async function eventNames(userId: string) {
  const { data, error } = await getSupabase()
    .from("events")
    .select("event_name")
    .eq("user_id", userId);
  assertOk(error);
  return new Set((data ?? []).map((row) => String(row.event_name)));
}

async function insertEvent(
  userId: string,
  simulatedDay: number,
  eventName: string,
  payload: Record<string, unknown>,
  once: boolean,
) {
  const supabase = getSupabase();
  if (once) {
    const { data, error } = await supabase
      .from("events")
      .select("id")
      .eq("user_id", userId)
      .eq("event_name", eventName)
      .limit(1);
    assertOk(error);
    if (data && data.length > 0) return;
  }

  const { error } = await supabase.from("events").insert({
    user_id: userId,
    simulated_day: simulatedDay,
    event_name: eventName,
    payload,
  });
  if (once && error && "code" in error && error.code === "23505") return;
  assertOk(error);
}

export async function ensureUser(userId: string) {
  const supabase = getSupabase();
  const settings = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      notification_permission: true,
      experiment_group: "test",
    },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
  assertOk(settings.error);

  const state = await supabase.from("user_state").upsert(
    { user_id: userId },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
  assertOk(state.error);
}

export async function loadSnapshot(userId: string): Promise<Snapshot> {
  const supabase = getSupabase();
  const [settingsRes, stateRes, workoutsRes, entriesRes, eventsRes] = await Promise.all([
    supabase.from("user_settings").select("*").eq("user_id", userId).single(),
    supabase.from("user_state").select("*").eq("user_id", userId).single(),
    supabase.from("workouts").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    supabase
      .from("workout_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase.from("events").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
  ]);

  assertOk(settingsRes.error);
  assertOk(stateRes.error);
  assertOk(workoutsRes.error);
  assertOk(entriesRes.error);
  assertOk(eventsRes.error);

  if (!settingsRes.data || !stateRes.data) {
    throw new Error("Användardata saknas");
  }

  return {
    userId,
    settings: parseSettings(settingsRes.data as UserSettings),
    state: parseState(stateRes.data as UserState),
    workouts: (workoutsRes.data ?? []) as Workout[],
    entries: ((entriesRes.data ?? []) as WorkoutEntry[]).map(parseEntry),
    events: ((eventsRes.data ?? []) as AppEvent[]).map((event) => ({
      ...event,
      payload: asRecord(event.payload),
    })),
  };
}

export async function applyAutomation(userId: string) {
  const snapshot = await loadSnapshot(userId);
  const existingEvents = await eventNames(userId);
  const plan = planAutomation({
    settings: snapshot.settings,
    state: snapshot.state,
    existingEvents,
  });

  for (const event of plan.events) {
    await insertEvent(userId, snapshot.state.current_day, event.event_name, event.payload, true);
  }

  if (Object.keys(plan.statePatch).length === 0) return;

  const { error } = await getSupabase()
    .from("user_state")
    .update({
      ...plan.statePatch,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  assertOk(error);
}

async function finish(userId: string) {
  await applyAutomation(userId);
  return loadSnapshot(userId);
}

export async function bootUser(userId: string) {
  await ensureUser(userId);
  return finish(userId);
}

export async function selectFrequency(userId: string, frequency: Frequency) {
  const snapshot = await loadSnapshot(userId);
  const { error } = await getSupabase()
    .from("user_settings")
    .update({
      training_frequency: frequency,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  assertOk(error);

  await insertEvent(
    userId,
    snapshot.state.current_day,
    "training_frequency_selected",
    { training_frequency: frequency },
    true,
  );

  return finish(userId);
}

export async function saveWorkout(userId: string, input: WorkoutInput) {
  if (!Number.isFinite(input.weight) || input.weight <= 0) {
    throw new Error("Ange en vikt");
  }
  if (!Number.isInteger(input.reps) || input.reps <= 0) {
    throw new Error("Ange repetitioner");
  }

  const snapshot = await loadSnapshot(userId);
  const supabase = getSupabase();
  const isFirst = !snapshot.state.first_workout_completed;
  if (isFirst && daysUntilNextWorkout(snapshot.settings.training_frequency) == null) {
    throw new Error("Träningsfrekvens saknas");
  }

  const workoutInsert = await supabase
    .from("workouts")
    .insert({
      user_id: userId,
      simulated_day: snapshot.state.current_day,
    })
    .select("id")
    .single();
  assertOk(workoutInsert.error);
  if (!workoutInsert.data) throw new Error("Passet kunde inte sparas");

  const workoutId = String(workoutInsert.data.id);
  const entryInsert = await supabase.from("workout_entries").insert({
    workout_id: workoutId,
    user_id: userId,
    exercise_id: input.exerciseId,
    exercise_name: input.exerciseName,
    weight: input.weight,
    reps: input.reps,
  });

  if (entryInsert.error) {
    await supabase.from("workouts").delete().eq("id", workoutId);
    throw new Error(entryInsert.error.message);
  }

  if (isFirst) {
    const offset = daysUntilNextWorkout(snapshot.settings.training_frequency);
    if (offset == null) throw new Error("Träningsfrekvens saknas");

    const { error } = await supabase
      .from("user_state")
      .update({
        first_workout_completed: true,
        measurement_active: true,
        expected_next_workout_at: snapshot.state.current_day + offset,
        communication_active: snapshot.settings.experiment_group === "test",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    assertOk(error);

    await insertEvent(
      userId,
      snapshot.state.current_day,
      "first_workout_completed",
      {
        exercise_id: input.exerciseId,
        weight: input.weight,
        reps: input.reps,
      },
      true,
    );

    if (snapshot.settings.experiment_group === "test") {
      await insertEvent(userId, snapshot.state.current_day, "post_workout_message_shown", {}, true);
    }
  } else {
    const hadPrevious = snapshot.entries.some((entry) => entry.exercise_id === input.exerciseId);
    const statePatch: Partial<UserState> = {};

    if (hadPrevious && !snapshot.state.first_comparison_available) {
      statePatch.first_comparison_available = true;
      statePatch.comparison_day = snapshot.state.current_day;
      statePatch.communication_active = false;
      if (snapshot.state.current_day <= 14) {
        statePatch.kpi_success = true;
      }
    }

    if (Object.keys(statePatch).length > 0) {
      const { error } = await supabase
        .from("user_state")
        .update({
          ...statePatch,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      assertOk(error);
    }

    if (snapshot.workouts.length + 1 === 2) {
      await insertEvent(
        userId,
        snapshot.state.current_day,
        "second_workout_completed",
        {
          exercise_id: input.exerciseId,
          weight: input.weight,
          reps: input.reps,
        },
        true,
      );
    }

    if (hadPrevious) {
      await insertEvent(
        userId,
        snapshot.state.current_day,
        "comparable_exercise_logged",
        { exercise_id: input.exerciseId },
        false,
      );
      if (!snapshot.state.first_comparison_available) {
        await insertEvent(
          userId,
          snapshot.state.current_day,
          "first_comparison_available",
          {
            exercise_id: input.exerciseId,
            comparison_day: snapshot.state.current_day,
          },
          true,
        );
      }
    }
  }

  return finish(userId);
}

export async function markReturned(userId: string) {
  const snapshot = await loadSnapshot(userId);
  if (!snapshot.state.user_returned) {
    const { error } = await getSupabase()
      .from("user_state")
      .update({
        user_returned: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    assertOk(error);
    await insertEvent(userId, snapshot.state.current_day, "app_returned", {}, true);
  }
  return finish(userId);
}

export async function setCurrentDay(userId: string, day: number) {
  const snapshot = await loadSnapshot(userId);
  if (day < snapshot.state.current_day) return snapshot;

  const { error } = await getSupabase()
    .from("user_state")
    .update({
      current_day: day,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  assertOk(error);
  return finish(userId);
}

export async function setNotificationPermission(userId: string, allowed: boolean) {
  const { error } = await getSupabase()
    .from("user_settings")
    .update({
      notification_permission: allowed,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  assertOk(error);
  return finish(userId);
}

export async function resetDemo(userId: string, group: ExperimentGroup = "test") {
  const supabase = getSupabase();
  const entries = await supabase.from("workout_entries").delete().eq("user_id", userId);
  assertOk(entries.error);
  const workouts = await supabase.from("workouts").delete().eq("user_id", userId);
  assertOk(workouts.error);
  const events = await supabase.from("events").delete().eq("user_id", userId);
  assertOk(events.error);

  const now = new Date().toISOString();
  const state = await supabase
    .from("user_state")
    .update({
      current_day: 0,
      first_workout_completed: false,
      first_comparison_available: false,
      expected_next_workout_at: null,
      communication_active: false,
      measurement_active: false,
      push_sent: false,
      user_returned: false,
      comparison_day: null,
      kpi_success: null,
      updated_at: now,
    })
    .eq("user_id", userId);
  assertOk(state.error);

  const settings = await supabase
    .from("user_settings")
    .update({
      training_frequency: null,
      notification_permission: true,
      experiment_group: group,
      updated_at: now,
    })
    .eq("user_id", userId);
  assertOk(settings.error);

  return loadSnapshot(userId);
}
