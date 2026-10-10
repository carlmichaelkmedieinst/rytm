"use client";

import Link from "next/link";
import { useState } from "react";
import { Code, DemoControl, Eyebrow, PrimaryButton, Tag } from "@/components/demo/ui";
import { ProductScreens } from "@/components/ProductView";
import { exerciseLabel } from "@/lib/exercises";
import { comparisonPair, formatWeight, productScreen } from "@/lib/format";
import {
  CAMPAIGN_HEADLINES,
  DEMO_EMAIL,
  DEMO_PATH,
  QR_LOCATIONS,
  type DemoSource,
  type MaProfile,
} from "@/lib/lifecycle";
import type { Frequency, Snapshot, WorkoutInput } from "@/lib/types";

export function DemoUserView({
  snapshot,
  profile,
  source,
  intent,
  busy,
  onJoin,
  onLaunch,
  onCreateAccount,
  onSelectFrequency,
  onSaveWorkout,
  onStartNext,
  onShare,
}: {
  snapshot: Snapshot;
  profile: MaProfile;
  source: DemoSource | null;
  intent: "idle" | "log";
  busy: boolean;
  onJoin: (consent: { launchConsent: boolean; marketingConsent: boolean }) => void;
  onLaunch: () => void;
  onCreateAccount: () => void;
  onSelectFrequency: (frequency: Frequency) => void;
  onSaveWorkout: (input: WorkoutInput) => void;
  onStartNext: () => void;
  onShare: () => void;
}) {
  if (profile.lifecycle === "visitor") {
    return source ? <WaitlistForm source={source} busy={busy} onJoin={onJoin} /> : <StartDemo />;
  }

  if (profile.lifecycle === "waitlist") {
    return profile.launchNotified ? (
      <LaunchNotice busy={busy} onCreateAccount={onCreateAccount} />
    ) : (
      <Waitlisted busy={busy} onLaunch={onLaunch} />
    );
  }

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center gap-3 text-sm text-muted">
        <span>
          Konto <Code>{profile.email}</Code> · kopplat till väntelisteprofilen
        </span>
        <Tag>Simulerad / föreslagen implementation</Tag>
      </div>
      {profile.lifecycle === "account_created" ? (
        <div className="mb-10 border-l-2 border-rose bg-blush/60 px-5 py-4">
          <Eyebrow>Onboarding-hjälp · i appen</Eyebrow>
          <p className="mt-2">Logga ditt första pass. En övning räcker för att komma igång.</p>
        </div>
      ) : null}
      <ProductScreens
        snapshot={snapshot}
        screen={productScreen(snapshot, intent)}
        busy={busy}
        locale="sv"
        onSelectFrequency={onSelectFrequency}
        onSaveWorkout={onSaveWorkout}
        onStartNext={onStartNext}
      />
      {profile.lifecycle === "activated" && intent === "idle" ? (
        <Activated snapshot={snapshot} profile={profile} busy={busy} onShare={onShare} />
      ) : null}
    </div>
  );
}

function StartDemo() {
  return (
    <section className="max-w-xl">
      <h1 className="font-serif text-4xl leading-tight tracking-[-0.03em]">
        Demon startar där användaren möter Rytm.
      </h1>
      <p className="mt-6 leading-relaxed text-muted">
        Länken saknar QR-källa. Starta från QR-koden vid utegymmet för att följa hela flödet.
      </p>
      <Link
        href={DEMO_PATH}
        className="mt-10 inline-block rounded-full bg-rose px-8 py-3 text-white"
      >
        Starta demo från Rydebäck utegym
      </Link>
    </section>
  );
}

function WaitlistForm({
  source,
  busy,
  onJoin,
}: {
  source: DemoSource;
  busy: boolean;
  onJoin: (consent: { launchConsent: boolean; marketingConsent: boolean }) => void;
}) {
  const [launchConsent, setLaunchConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const location = QR_LOCATIONS[source.qr_id];

  return (
    <section className="max-w-xl">
      <div className="flex flex-wrap items-center gap-3">
        <Tag tone="rose">QR · {location ?? source.qr_id}</Tag>
        <span className="text-sm text-muted">
          <Code>utm_content={source.utm_content || "—"}</Code>
        </span>
      </div>
      <h1 className="mt-8 font-serif text-[clamp(2.75rem,5vw,4.5rem)] leading-[0.98] tracking-[-0.03em]">
        {CAMPAIGN_HEADLINES[source.utm_content] ?? "Bli först med Rytm."}
      </h1>
      <p className="mt-6 text-lg">Bli först – få en notis när appen lanseras.</p>

      <label className="mt-10 block">
        <span className="text-sm text-muted">E-post</span>
        <input
          readOnly
          value={DEMO_EMAIL}
          className="mt-2 w-full border-b border-line bg-transparent pb-2 font-serif text-2xl outline-none"
        />
        <span className="mt-2 block text-xs text-muted">Syntetisk testanvändare · ingen riktig person</span>
      </label>

      <fieldset className="mt-8 space-y-4">
        <ConsentBox
          checked={launchConsent}
          onChange={setLaunchConsent}
          title="Meddela mig när appen lanseras."
          detail="Lanseringsnotis · krävs för väntelistan"
        />
        <ConsentBox
          checked={marketingConsent}
          onChange={setMarketingConsent}
          title="Jag vill även få tips och erbjudanden från Rytm."
          detail="Marknadsföring · frivilligt och separat"
        />
      </fieldset>

      <div className="mt-10">
        <PrimaryButton
          disabled={busy || !launchConsent}
          onClick={() => onJoin({ launchConsent, marketingConsent })}
        >
          {busy ? "Sparar" : "Skriv upp mig"}
        </PrimaryButton>
      </div>
    </section>
  );
}

function ConsentBox({
  checked,
  onChange,
  title,
  detail,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  detail: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 accent-rose"
      />
      <span>
        <span className="block">{title}</span>
        <span className="block text-xs tracking-[0.04em] text-muted">{detail}</span>
      </span>
    </label>
  );
}

function Waitlisted({ busy, onLaunch }: { busy: boolean; onLaunch: () => void }) {
  return (
    <section className="max-w-xl">
      <h1 className="font-serif text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] tracking-[-0.03em]">
        Du står på väntelistan.
      </h1>
      <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
        Vi hör av oss när Rytm lanseras. Inget annat förrän dess.
      </p>
      <div className="mt-12">
        <DemoControl disabled={busy} onClick={onLaunch}>
          Simulera lansering
        </DemoControl>
      </div>
    </section>
  );
}

function LaunchNotice({ busy, onCreateAccount }: { busy: boolean; onCreateAccount: () => void }) {
  return (
    <section className="max-w-xl">
      <Tag tone="rose">Simulerad lanseringsnotis</Tag>
      <div className="mt-5 border border-line bg-white shadow-[0_16px_40px_rgba(58,34,48,0.08)]">
        <div className="flex gap-4 p-5">
          <div className="w-1 shrink-0 bg-rose" aria-hidden="true" />
          <div>
            <p className="text-[11px] tracking-[0.22em]">RYTM · till {DEMO_EMAIL}</p>
            <p className="mt-3 font-serif text-2xl leading-snug">Rytm finns nu.</p>
            <p className="mt-2 leading-relaxed text-muted">
              Du skrev upp dig vid utegymmet. Skapa ditt konto och logga ditt första pass.
            </p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">Inget riktigt mejl skickas i demon.</p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <PrimaryButton disabled={busy} onClick={onCreateAccount}>
          Skapa konto
        </PrimaryButton>
        <Tag>Simulerad / föreslagen implementation</Tag>
      </div>
    </section>
  );
}

function Activated({
  snapshot,
  profile,
  busy,
  onShare,
}: {
  snapshot: Snapshot;
  profile: MaProfile;
  busy: boolean;
  onShare: () => void;
}) {
  const pair = comparisonPair(snapshot.entries);

  return (
    <section className="mt-14 border-t border-line pt-10">
      <div className="flex flex-wrap items-center gap-3">
        <span className="bg-rose px-3 py-1 text-xs tracking-[0.2em] text-white uppercase">Aktiverad</span>
        <span className="text-sm text-muted">Aktiveringskommunikation stoppad</span>
      </div>

      {pair ? (
        <div className="mt-8 max-w-sm bg-ink px-8 py-10 text-cream">
          <p className="text-[11px] tracking-[0.28em]">RYTM</p>
          <p className="mt-6 text-sm text-cream/70">{exerciseLabel("sv", pair.current.exercise_id)}</p>
          <p className="mt-2 font-serif text-4xl tracking-[-0.02em]">
            {formatWeight(pair.previous.weight)} × {pair.previous.reps} → {formatWeight(pair.current.weight)} ×{" "}
            {pair.current.reps}
          </p>
          <p className="mt-6 font-serif text-2xl text-blush italic">DET HÄNDER.</p>
        </div>
      ) : null}

      {profile.shareId ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <span>
            Delat · <Code>share_id = {profile.shareId}</Code>
          </span>
          <Tag>Föreslagen advocacy-implementation</Tag>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <PrimaryButton disabled={busy} onClick={onShare}>
            Sprid träningsglädjen!
          </PrimaryButton>
          <span className="text-xs text-muted">Valfritt steg · ingen Instagram-koppling</span>
        </div>
      )}
    </section>
  );
}
