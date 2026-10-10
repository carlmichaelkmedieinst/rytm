"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AppHeader } from "@/components/AppHeader";
import { InternalView } from "@/components/InternalView";
import { ProductView } from "@/components/ProductView";
import { PushNotice } from "@/components/PushNotice";
import {
  advanceToDay,
  markReturned,
  resetDemo,
  saveWorkout,
  selectFrequency,
  setNotificationPermission,
} from "@/lib/data";
import { demoHasProgress, productScreen } from "@/lib/format";
import {
  readLocale,
  serverLocale,
  sessionErrorMessage,
  subscribeLocale,
  t,
  translateKnownError,
  writeLocale,
  type Locale,
} from "@/lib/i18n";
import type { ExperimentGroup, Frequency, WorkoutInput } from "@/lib/types";
import { useSnapshot } from "@/lib/useSnapshot";

type View = "product" | "internal";

export function RytmApp() {
  const { snapshot, busy, error, authError, follow, run } = useSnapshot();
  const [view, setView] = useState<View>("product");
  const [intent, setIntent] = useState<"idle" | "log">("idle");
  const [pushDismissed, setPushDismissed] = useState(false);
  const [pushActive, setPushActive] = useState(false);
  const locale = useSyncExternalStore<Locale>(subscribeLocale, readLocale, serverLocale);

  const pushReady = Boolean(snapshot?.state.push_sent && !snapshot.state.user_returned);
  if (pushReady !== pushActive) {
    setPushActive(pushReady);
    setPushDismissed(false);
  }

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function selectLocale(next: Locale) {
    writeLocale(next);
  }

  if (authError) {
    return (
      <div className="min-h-screen">
        <AppHeader view={view} locale={locale} onView={setView} onLocale={selectLocale} />
        <main className="mx-auto flex min-h-[calc(100vh-4.75rem)] max-w-xl flex-col justify-center px-6">
          <h1 className="font-serif text-4xl leading-tight tracking-[-0.03em]">
            {t(locale, "sessionFailed")}
          </h1>
          <p className="mt-6 leading-relaxed text-muted">{sessionErrorMessage(locale, authError)}</p>
        </main>
      </div>
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
      <AppHeader view={view} locale={locale} onView={setView} onLocale={selectLocale} />
      {error ? (
        <p className="px-[clamp(1.25rem,4vw,4.5rem)] pt-4 text-sm text-rose">
          {translateKnownError(locale, error)}
        </p>
      ) : null}
      {pushReady && !pushDismissed ? (
        <PushNotice locale={locale} onDismiss={() => setPushDismissed(true)} />
      ) : null}
      {view === "product" ? (
        <ProductView
          snapshot={snapshot}
          screen={screen}
          busy={busy}
          locale={locale}
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
          locale={locale}
          onAdvanceDay={() => {
            follow(advanceToDay(userId, (currentDay) => currentDay + 1));
          }}
          onNextWindow={() => {
            const expected = snapshot.state.expected_next_workout_at;
            if (expected == null) return;
            follow(advanceToDay(userId, expected));
          }}
          onDay7={() => {
            follow(advanceToDay(userId, 7));
          }}
          onDay14={() => {
            follow(advanceToDay(userId, 14));
          }}
          onGroup={(group: ExperimentGroup) => {
            if (group === snapshot.settings.experiment_group) return;
            if (
              demoHasProgress(snapshot) &&
              !window.confirm(t(locale, "confirmGroup"))
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
            if (!window.confirm(t(locale, "confirmReset"))) return;
            setIntent("idle");
            void run(() => resetDemo(userId, "test"));
          }}
        />
      )}
    </div>
  );
}