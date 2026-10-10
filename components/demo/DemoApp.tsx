"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BlueprintPanel } from "@/components/demo/BlueprintPanel";
import { DemoMaView } from "@/components/demo/DemoMaView";
import { DemoUserView } from "@/components/demo/DemoUserView";
import {
  createAccount,
  joinWaitlist,
  markReturned,
  resetDemo,
  saveWorkout,
  selectFrequency,
  shareResult,
  simulateLaunch,
} from "@/lib/data";
import { sessionErrorMessage, t, translateKnownError } from "@/lib/i18n";
import { DEMO_PATH, maProfile, type DemoSource } from "@/lib/lifecycle";
import { useSnapshot } from "@/lib/useSnapshot";

const locale = "sv";

export function DemoApp({ source }: { source: DemoSource | null }) {
  const router = useRouter();
  const { snapshot, busy, error, authError, run } = useSnapshot();
  const [intent, setIntent] = useState<"idle" | "log">("idle");

  if (authError) {
    return (
      <DemoFrame>
        <p className="mx-auto max-w-xl px-6 py-24 leading-relaxed text-muted">
          {sessionErrorMessage(locale, authError)}
        </p>
      </DemoFrame>
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
  const profile = maProfile(snapshot);

  function reset() {
    if (!window.confirm(t(locale, "confirmReset"))) return;
    setIntent("idle");
    void run(() => resetDemo(userId, "test")).then(() => router.replace(DEMO_PATH));
  }

  return (
    <DemoFrame onReset={reset} busy={busy}>
      {error ? (
        <p className="px-[clamp(1.25rem,4vw,4.5rem)] pt-4 text-sm text-rose">
          {translateKnownError(locale, error)}
        </p>
      ) : null}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="border-b border-line px-[clamp(1.25rem,4vw,4.5rem)] py-10 lg:border-r lg:border-b-0">
          <ViewLabel letter="A" title="Användarvy" />
          <DemoUserView
            snapshot={snapshot}
            profile={profile}
            source={source}
            intent={intent}
            busy={busy}
            onJoin={(consent) => {
              if (!source) return;
              void run(() => joinWaitlist(userId, { source, ...consent }));
            }}
            onLaunch={() => void run(() => simulateLaunch(userId))}
            onCreateAccount={() => void run(() => createAccount(userId))}
            onSelectFrequency={(frequency) => void run(() => selectFrequency(userId, frequency))}
            onSaveWorkout={(input) => {
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
            onShare={() => void run(() => shareResult(userId))}
          />
        </section>
        <section className="bg-white/60 px-[clamp(1.25rem,4vw,4.5rem)] py-10">
          <ViewLabel letter="B" title="MA / Internal view" live />
          <DemoMaView snapshot={snapshot} profile={profile} />
        </section>
      </div>
      <BlueprintPanel profile={profile} />
    </DemoFrame>
  );
}

function DemoFrame({
  children,
  onReset,
  busy,
}: {
  children: ReactNode;
  onReset?: () => void;
  busy?: boolean;
}) {
  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line px-[clamp(1.25rem,4vw,4.5rem)] py-5">
        <div className="flex items-baseline gap-4">
          <p className="font-serif text-sm tracking-[0.28em]">RYTM</p>
          <p className="text-sm text-muted">Marketing Automation-demo · syntetisk testanvändare</p>
        </div>
        {onReset ? (
          <button
            type="button"
            disabled={busy}
            onClick={onReset}
            className="cursor-pointer text-sm text-muted underline decoration-line underline-offset-4 disabled:opacity-50"
          >
            {t(locale, "resetDemo")}
          </button>
        ) : null}
      </header>
      {children}
    </div>
  );
}

function ViewLabel({ letter, title, live }: { letter: string; title: string; live?: boolean }) {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <p className="text-xs tracking-[0.18em] text-muted uppercase">
        {letter} · {title}
      </p>
      {live ? (
        <p className="flex items-center gap-2 text-xs tracking-[0.14em] text-rose uppercase">
          <span className="size-1.5 rounded-full bg-rose" aria-hidden="true" />
          Live från Supabase
        </p>
      ) : null}
    </div>
  );
}
