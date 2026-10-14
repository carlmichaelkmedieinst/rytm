"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  clearStoredGeneration,
  createAccount,
  demoAccessToken,
  DemoClientError,
  ensureParticipant,
  fetchGeneration,
  fetchTimeline,
  isStaleGeneration,
  joinWaitlist,
  readStoredGeneration,
  registerVisit,
  registerWorkout,
  simulateLaunch,
  userFacingError,
  writeStoredGeneration,
} from "@/lib/demo/browser";
import { sourceLabel } from "@/lib/demo/source";
import { holdVisitKey, releaseVisitKey } from "@/components/demo/visit-key";

const LOCAL_PART = /^[a-z0-9](?:[a-z0-9._-]{0,30}[a-z0-9])?$/;
const STEPS = ["Besök", "Väntelista", "Lansering", "Konto", "Pass", "Aktiverad"] as const;

type Journey = {
  email: string;
  source: string;
  restarted: boolean;
};

type Phase =
  | { name: "loading" }
  | { name: "error"; message: string }
  | ({ name: "form" } & Omit<Journey, "email">)
  | ({ name: "waitlist" | "launch" | "account" | "first" | "activated" } & Journey);

function textField(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value ? value : null;
}

function eventNames(timeline: Record<string, unknown>) {
  const events = Array.isArray(timeline.events) ? timeline.events : [];
  const names = new Set<string>();
  for (const event of events) {
    if (!event || typeof event !== "object" || !("event_name" in event)) continue;
    const name = event.event_name;
    if (typeof name === "string") names.add(name);
  }
  return names;
}

function previewAddress(localPart: string) {
  const local = localPart.trim().toLowerCase();
  if (!local) return "namn@rytm.test";
  if (!LOCAL_PART.test(local)) return null;
  return `${local}@rytm.test`;
}

function phaseFrom(timeline: Record<string, unknown>, restarted: boolean, qrId: string): Phase {
  const email = textField(timeline, "fictional_email");
  const source = sourceLabel(textField(timeline, "qr_id") ?? qrId);
  const status = textField(timeline, "lifecycle_status") ?? "visitor";
  const names = eventNames(timeline);
  if (!email || status === "visitor") return { name: "form", source, restarted };
  const journey = { email, source, restarted };
  if (status === "activated") return { name: "activated", ...journey };
  if (status === "awaiting_comparison") return { name: "first", ...journey };
  if (status === "account_created") return { name: "account", ...journey };
  if (names.has("launch_notification_sent")) return { name: "launch", ...journey };
  return { name: "waitlist", ...journey };
}

function stepIndex(phase: Phase) {
  if (phase.name === "waitlist") return 1;
  if (phase.name === "launch") return 2;
  if (phase.name === "account") return 3;
  if (phase.name === "first") return 4;
  if (phase.name === "activated") return 5;
  return 0;
}

function Progress({ phase }: { phase: Phase }) {
  const index = stepIndex(phase);
  return (
    <div className="mt-8" aria-label={`Steg ${index + 1} av ${STEPS.length}: ${STEPS[index]}`}>
      <p className="text-[11px] tracking-[0.16em] text-muted uppercase">
        Steg {index + 1} av {STEPS.length} · {STEPS[index]}
      </p>
      <div className="mt-2 h-0.5 bg-line">
        <div className="h-full bg-rose" style={{ width: `${((index + 1) / STEPS.length) * 100}%` }} />
      </div>
    </div>
  );
}

function RestartNote({ restarted }: { restarted: boolean }) {
  if (!restarted) return null;
  return (
    <p className="mb-6 border-l-2 border-rose pl-4 text-sm leading-relaxed" role="status">
      Demonstrationen har startats om. Du börjar en ny resa.
    </p>
  );
}

function ActionButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-8 min-h-12 w-full cursor-pointer rounded-full bg-rose px-8 text-white disabled:cursor-default disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function ParticipantJourney({ qrId, source }: { qrId: string; source: string }) {
  const [phase, setPhase] = useState<Phase>({ name: "loading" });
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [localPart, setLocalPart] = useState("");
  const [launchConsent, setLaunchConsent] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const visitKeyRef = useRef("");
  const pending = useRef(false);

  useEffect(() => {
    const visitKey = holdVisitKey(qrId);
    visitKeyRef.current = visitKey;
    let cancelled = false;

    async function currentGeneration(forceFresh: boolean) {
      if (!forceFresh) {
        const stored = readStoredGeneration();
        if (stored) return stored;
      }
      const next = await fetchGeneration();
      writeStoredGeneration(next);
      return next;
    }

    async function openJourney(generation: string) {
      const token = await demoAccessToken();
      await ensureParticipant(token, generation, qrId);
      await registerVisit(token, generation, qrId, visitKey);
      return fetchTimeline(token, generation);
    }

    async function start() {
      try {
        let generation = await currentGeneration(false);
        let restarted = false;
        let timeline: Record<string, unknown>;
        try {
          timeline = await openJourney(generation);
        } catch (error) {
          if (!isStaleGeneration(error)) throw error;
          clearStoredGeneration();
          generation = await currentGeneration(true);
          restarted = true;
          timeline = await openJourney(generation);
        }
        if (cancelled) return;
        setGenerationId(generation);
        setPhase(phaseFrom(timeline, restarted, qrId));
      } catch (error) {
        if (!cancelled) setPhase({ name: "error", message: userFacingError(error) });
      }
    }

    void start();
    return () => {
      cancelled = true;
      releaseVisitKey(qrId);
    };
  }, [qrId]);

  async function restart() {
    clearStoredGeneration();
    const generation = await fetchGeneration();
    writeStoredGeneration(generation);
    setGenerationId(generation);
    const token = await demoAccessToken();
    await ensureParticipant(token, generation, qrId);
    if (visitKeyRef.current) await registerVisit(token, generation, qrId, visitKeyRef.current);
    const timeline = await fetchTimeline(token, generation);
    setLocalPart("");
    setLaunchConsent(false);
    setPhase(phaseFrom(timeline, true, qrId));
  }

  async function confirm(run: (token: string, generation: string) => Promise<unknown>, expected: Phase["name"]) {
    if (pending.current || !generationId || phase.name === "loading" || phase.name === "error") return;
    const restarted = phase.restarted;
    pending.current = true;
    setBusy(true);
    setStepError(null);
    try {
      const token = await demoAccessToken();
      await run(token, generationId);
      const timeline = await fetchTimeline(token, generationId);
      const next = phaseFrom(timeline, restarted, qrId);
      if (next.name !== expected) {
        throw new DemoClientError("failed", "Steget kunde inte bekräftas.");
      }
      setPhase(next);
    } catch (error) {
      if (isStaleGeneration(error)) {
        try {
          await restart();
        } catch (restartError) {
          setPhase({ name: "error", message: userFacingError(restartError) });
        }
      } else {
        setStepError(userFacingError(error));
      }
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase.name !== "form") return;
    const local = localPart.trim().toLowerCase();
    if (!LOCAL_PART.test(local)) {
      setStepError("Ange bara namnet före @rytm.test");
      return;
    }
    if (!launchConsent) {
      setStepError("Kryssa i att du vill få det simulerade lanseringsbeskedet.");
      return;
    }
    await confirm(async (token, generation) => {
      await joinWaitlist(token, generation, local, true);
    }, "waitlist");
  }

  const address = previewAddress(localPart);
  const showProgress = phase.name !== "loading" && phase.name !== "error";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <p className="text-[11px] tracking-[0.28em] text-muted uppercase">Rytm</p>
      {showProgress ? <Progress phase={phase} /> : null}
      {phase.name === "loading" ? (
        <p className="mt-10 font-serif text-3xl" role="status">
          Startar din resa…
        </p>
      ) : null}
      {phase.name === "error" ? (
        <div className="mt-10" role="alert">
          <h1 className="font-serif text-4xl leading-tight tracking-[-0.03em]">Resan kunde inte startas</h1>
          <p className="mt-4 leading-relaxed text-muted">{phase.message}</p>
          <button
            type="button"
            className="mt-8 min-h-12 cursor-pointer rounded-full bg-rose px-8 text-white"
            onClick={() => window.location.reload()}
          >
            Försök igen
          </button>
        </div>
      ) : null}
      {phase.name === "form" ? (
        <form className="mt-10" onSubmit={submit} noValidate>
          <RestartNote restarted={phase.restarted} />
          <h1 className="font-serif text-4xl leading-tight tracking-[-0.03em]">
            Vill du vara med när Rytm lanseras?
          </h1>
          <p className="mt-4 leading-relaxed text-muted">
            Det här är en demonstration. Ange ett påhittat namn så skapar vi en testadress. Inga riktiga mejl
            skickas.
          </p>
          <label className="mt-8 block text-sm" htmlFor="local-part">
            Påhittat namn
          </label>
          <input
            id="local-part"
            name="local_part"
            value={localPart}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            className="mt-2 min-h-12 w-full border border-line bg-white px-4 text-base outline-none"
            onChange={(event) => {
              setLocalPart(event.target.value);
              setStepError(null);
            }}
            aria-invalid={stepError ? true : undefined}
            aria-describedby="address-preview"
          />
          <p id="address-preview" className="mt-3 text-sm text-muted">
            Testadress: <span className="text-ink">{address ?? "Kontrollera namnet"}</span>
          </p>
          <label className="mt-8 flex min-h-12 items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              className="mt-1 size-5 accent-rose"
              checked={launchConsent}
              onChange={(event) => {
                setLaunchConsent(event.target.checked);
                setStepError(null);
              }}
            />
            <span>Jag vill få ett simulerat lanseringsbesked i den här demon.</span>
          </label>
          {stepError ? (
            <p className="mt-4 text-sm text-rose" role="alert">
              {stepError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="mt-8 min-h-12 w-full cursor-pointer rounded-full bg-rose px-8 text-white disabled:cursor-default disabled:opacity-50"
          >
            {busy ? "Sparar…" : "Gå med på väntelistan"}
          </button>
          <p className="mt-6 text-sm text-muted">Källa: {source}</p>
        </form>
      ) : null}
      {phase.name === "waitlist" ? (
        <section className="mt-10">
          <RestartNote restarted={phase.restarted} />
          <h1 className="font-serif text-4xl leading-tight tracking-[-0.03em]">Du är med på väntelistan.</h1>
          <p className="mt-4 leading-relaxed text-muted">
            Din anmälan är sparad, och du har tackat ja till ett lanseringsbesked. I strategin skickas det när Rytm
            lanseras, inte för att kunden ber om det. Knappen simulerar den lanseringshändelsen och startar det
            automatiska beskedet i demonstrationen. Inget riktigt mejl skickas.
          </p>
          <Facts email={phase.email} source={phase.source} status="På väntelistan" />
          {stepError ? (
            <p className="mt-4 text-sm text-rose" role="alert">
              {stepError}
            </p>
          ) : null}
          <ActionButton disabled={busy} onClick={() => void confirm((token, generation) => simulateLaunch(token, generation), "launch")}>
            {busy ? "Sparar…" : "Simulera lanseringen"}
          </ActionButton>
        </section>
      ) : null}
      {phase.name === "launch" ? (
        <section className="mt-10">
          <RestartNote restarted={phase.restarted} />
          <h1 className="font-serif text-4xl leading-tight tracking-[-0.03em]">Rytm har lanserats!</h1>
          <p className="mt-4 leading-relaxed">
            Du får nu det lanseringsbesked som du tackade ja till när du gick med på väntelistan.
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            Det här är ett simulerat besked i demonstrationen, inte ett riktigt mejl. Nästa steg skapar ett konto
            och kopplar det till din väntelisteanmälan.
          </p>
          <Facts email={phase.email} source={phase.source} status="Lanseringsbesked registrerat" />
          {stepError ? (
            <p className="mt-4 text-sm text-rose" role="alert">
              {stepError}
            </p>
          ) : null}
          <ActionButton disabled={busy} onClick={() => void confirm((token, generation) => createAccount(token, generation), "account")}>
            {busy ? "Sparar…" : "Skapa mitt konto"}
          </ActionButton>
        </section>
      ) : null}
      {phase.name === "account" ? (
        <section className="mt-10">
          <RestartNote restarted={phase.restarted} />
          <h1 className="font-serif text-4xl leading-tight tracking-[-0.03em]">Ditt konto är skapat.</h1>
          <p className="mt-4 leading-relaxed">Vi har kopplat din tidigare väntelisteanmälan till ditt nya konto.</p>
          <h2 className="mt-10 font-serif text-3xl leading-tight">Dags för ditt första pass.</h2>
          <p className="mt-4 leading-relaxed text-muted">
            Rytm hjälper dig att följa träningen över tid. I den här demonstrationen simulerar vi passet. Inga
            vikter eller övningar sparas.
          </p>
          {stepError ? (
            <p className="mt-4 text-sm text-rose" role="alert">
              {stepError}
            </p>
          ) : null}
          <ActionButton
            disabled={busy}
            onClick={() => void confirm((token, generation) => registerWorkout(token, generation, "first"), "first")}
          >
            {busy ? "Sparar…" : "Simulera första passet"}
          </ActionButton>
        </section>
      ) : null}
      {phase.name === "first" ? (
        <section className="mt-10">
          <RestartNote restarted={phase.restarted} />
          <h1 className="font-serif text-4xl leading-tight tracking-[-0.03em]">Första passet registrerat.</h1>
          <p className="mt-4 leading-relaxed text-muted">
            Ett simulerat pass räcker inte för aktivering. Jämförelsen kommer först när du gör passet igen.
          </p>
          {stepError ? (
            <p className="mt-4 text-sm text-rose" role="alert">
              {stepError}
            </p>
          ) : null}
          <ActionButton
            disabled={busy}
            onClick={() => void confirm((token, generation) => registerWorkout(token, generation, "second"), "activated")}
          >
            {busy ? "Sparar…" : "Simulera nästa pass"}
          </ActionButton>
        </section>
      ) : null}
      {phase.name === "activated" ? (
        <section className="mt-10">
          <RestartNote restarted={phase.restarted} />
          <h1 className="font-serif text-4xl leading-tight tracking-[-0.03em]">Du har hittat din Rytm.</h1>
          <p className="mt-4 leading-relaxed">
            Du har nu genomfört två simulerade träningspass och fått din första jämförelse. I vår strategi räknas
            detta som aktivering.
          </p>
          <figure className="mt-8 border border-line">
            <figcaption className="border-b border-line px-4 py-3 text-sm text-muted">
              Illustration. Värdena är inte loggade eller uppmätta.
            </figcaption>
            <div className="grid grid-cols-2">
              <div className="border-r border-line px-4 py-4">
                <p className="text-[11px] tracking-[0.16em] text-muted uppercase">Första passet</p>
                <p className="mt-2 font-serif text-3xl">40 kg</p>
                <p className="mt-1 text-sm text-muted">8 repetitioner</p>
              </div>
              <div className="px-4 py-4">
                <p className="text-[11px] tracking-[0.16em] text-muted uppercase">Andra passet</p>
                <p className="mt-2 font-serif text-3xl">42,5 kg</p>
                <p className="mt-1 text-sm text-muted">8 repetitioner</p>
              </div>
            </div>
          </figure>
          <Facts email={phase.email} source={phase.source} status="Aktiverad" />
          <p className="mt-8 leading-relaxed text-muted">
            Aktiveringsmeddelanden i demonstrationen har stoppats, eftersom villkoret för aktivering är uppfyllt.
            Inga riktiga mejl eller pushnotiser har skickats eller stoppats.
          </p>
        </section>
      ) : null}
    </main>
  );
}

function Facts({ email, source, status }: { email: string; source: string; status: string }) {
  return (
    <dl className="mt-8 grid gap-4 border-t border-line pt-6 text-sm">
      <div>
        <dt className="text-muted">Testadress</dt>
        <dd className="mt-1 text-base">{email}</dd>
      </div>
      <div>
        <dt className="text-muted">Källa</dt>
        <dd className="mt-1 text-base">{source}</dd>
      </div>
      <div>
        <dt className="text-muted">Status</dt>
        <dd className="mt-1 text-base">{status}</dd>
      </div>
    </dl>
  );
}
