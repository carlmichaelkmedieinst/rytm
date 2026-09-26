"use client";

import { useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { InternalView } from "@/components/InternalView";
import { ProductView } from "@/components/ProductView";
import { PushNotice } from "@/components/PushNotice";
import {
  bootUser,
  markReturned,
  resetDemo,
  saveWorkout,
  selectFrequency,
  setCurrentDay,
  setNotificationPermission,
} from "@/lib/data";
import { demoHasProgress, productScreen } from "@/lib/format";
import { getSupabase } from "@/lib/supabase/client";
import type { ExperimentGroup, Frequency, Snapshot, WorkoutInput } from "@/lib/types";

type View = "product" | "internal";

export function RytmApp() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [view, setView] = useState<View>("product");
  const [intent, setIntent] = useState<"idle" | "log">("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pushDismissed, setPushDismissed] = useState(false);
  const [pushActive, setPushActive] = useState(false);
  const busyRef = useRef(false);

  const pushReady = Boolean(snapshot?.state.push_sent && !snapshot.state.user_returned);
  if (pushReady !== pushActive) {
    setPushActive(pushReady);
    setPushDismissed(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const supabase = getSupabase();
        const sessionResult = await supabase.auth.getSession();
        if (sessionResult.error) throw sessionResult.error;

        let userId = sessionResult.data.session?.user.id;
        if (!userId) {
          const signedIn = await supabase.auth.signInAnonymously();
          if (signedIn.error) throw signedIn.error;
          userId = signedIn.data.user?.id;
        }
        if (!userId) throw new Error("Anonym session saknas");

        const next = await bootUser(userId);
        if (!cancelled) setSnapshot(next);
      } catch (caught) {
        if (!cancelled) {
          setAuthError(caught instanceof Error ? caught.message : "Sessionen kunde inte startas");
        }
      }
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, []);

  async function run(action: () => Promise<Snapshot>) {
    if (busyRef.current) return null;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const next = await action();
      setSnapshot(next);
      return next;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Något gick fel");
      return null;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  if (authError) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
        <p className="font-serif text-sm tracking-[0.28em]">RYTM</p>
        <h1 className="mt-8 font-serif text-4xl leading-tight tracking-[-0.03em]">
          Sessionen kunde inte startas.
        </h1>
        <p className="mt-6 leading-relaxed text-muted">{authMessage(authError)}</p>
      </main>
    );
  }

  if (!snapshot) {
    return (
      <main className="grid min-h-screen place-items-center">
        <p className="font-serif text-sm tracking-[0.28em]">RYTM</p>
      </main>
    );
  }

  const userId = snapshot.userId;
  const screen = productScreen(snapshot, intent);

  return (
    <div className="min-h-screen">
      <AppHeader view={view} onView={setView} />
      {error ? (
        <p className="px-[clamp(1.25rem,4vw,4.5rem)] pt-4 text-sm text-rose">{error}</p>
      ) : null}
      {pushReady && !pushDismissed ? <PushNotice onDismiss={() => setPushDismissed(true)} /> : null}
      {view === "product" ? (
        <ProductView
          snapshot={snapshot}
          screen={screen}
          busy={busy}
          onSelectFrequency={(frequency: Frequency) => {
            void run(() => selectFrequency(userId, frequency));
          }}
          onSaveWorkout={(input: WorkoutInput) => {
            void run(async () => {
              const next = await saveWorkout(userId, input);
              setIntent("idle");
              return next;
            });
          }}
          onStartNext={() => {
            void run(async () => {
              const next = await markReturned(userId);
              setIntent("log");
              return next;
            });
          }}
        />
      ) : (
        <InternalView
          snapshot={snapshot}
          busy={busy}
          onAdvanceDay={() => {
            void run(() => setCurrentDay(userId, snapshot.state.current_day + 1));
          }}
          onNextWindow={() => {
            const expected = snapshot.state.expected_next_workout_at;
            if (expected == null) return;
            void run(() => setCurrentDay(userId, expected));
          }}
          onDay7={() => {
            void run(() => setCurrentDay(userId, 7));
          }}
          onDay14={() => {
            void run(() => setCurrentDay(userId, 14));
          }}
          onGroup={(group: ExperimentGroup) => {
            if (group === snapshot.settings.experiment_group) return;
            if (
              demoHasProgress(snapshot) &&
              !window.confirm("Bytet återställer demon för den här användaren. Fortsätt?")
            ) {
              return;
            }
            setIntent("idle");
            void run(() => resetDemo(userId, group));
          }}
          onPermission={(allowed) => {
            if (allowed === snapshot.settings.notification_permission) return;
            void run(() => setNotificationPermission(userId, allowed));
          }}
          onReset={() => {
            if (!window.confirm("Återställ demon för den här användaren?")) return;
            setIntent("idle");
            void run(() => resetDemo(userId, "test"));
          }}
        />
      )}
    </div>
  );
}

function authMessage(error: string) {
  if (error.toLowerCase().includes("anonymous")) {
    return "Anonym inloggning är avstängd i Supabase-projektet. Aktivera Anonymous under Authentication → Providers.";
  }
  return error;
}
