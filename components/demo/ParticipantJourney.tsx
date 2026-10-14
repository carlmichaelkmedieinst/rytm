"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  clearStoredGeneration,
  demoAccessToken,
  DemoClientError,
  ensureParticipant,
  fetchGeneration,
  fetchTimeline,
  isStaleGeneration,
  joinWaitlist,
  readStoredGeneration,
  registerVisit,
  userFacingError,
  writeStoredGeneration,
} from "@/lib/demo/browser";
import { sourceLabel } from "@/lib/demo/source";
import { holdVisitKey, releaseVisitKey } from "@/components/demo/visit-key";

const LOCAL_PART = /^[a-z0-9](?:[a-z0-9._-]{0,30}[a-z0-9])?$/;

type Phase =
  | { name: "loading" }
  | { name: "error"; message: string }
  | { name: "form"; restarted: boolean }
  | { name: "done"; email: string; source: string; restarted: boolean };

function textField(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value ? value : null;
}

function previewAddress(localPart: string) {
  const local = localPart.trim().toLowerCase();
  if (!local) return "namn@rytm.test";
  if (!LOCAL_PART.test(local)) return null;
  return `${local}@rytm.test`;
}

export function ParticipantJourney({ qrId, source }: { qrId: string; source: string }) {
  const [phase, setPhase] = useState<Phase>({ name: "loading" });
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [localPart, setLocalPart] = useState("");
  const [launchConsent, setLaunchConsent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const visitKeyRef = useRef("");

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
        const email = textField(timeline, "fictional_email");
        const status = textField(timeline, "lifecycle_status");
        const storedSource = sourceLabel(textField(timeline, "qr_id") ?? qrId);
        if (email && status && status !== "visitor") {
          setPhase({ name: "done", email, source: storedSource, restarted });
          return;
        }
        setPhase({ name: "form", restarted });
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !generationId) return;
    const local = localPart.trim().toLowerCase();
    if (!LOCAL_PART.test(local)) {
      setFormError("Ange bara namnet före @rytm.test");
      return;
    }
    if (!launchConsent) {
      setFormError("Kryssa i att du vill få det simulerade lanseringsbeskedet.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const token = await demoAccessToken();
      let generation = generationId;
      let restarted = phase.name === "form" && phase.restarted;
      try {
        await joinWaitlist(token, generation, local, true);
      } catch (error) {
        if (!isStaleGeneration(error)) throw error;
        clearStoredGeneration();
        generation = await fetchGeneration();
        writeStoredGeneration(generation);
        setGenerationId(generation);
        await ensureParticipant(token, generation, qrId);
        if (visitKeyRef.current) {
          await registerVisit(token, generation, qrId, visitKeyRef.current);
        }
        await joinWaitlist(token, generation, local, true);
        restarted = true;
      }
      const timeline = await fetchTimeline(token, generation);
      const email = textField(timeline, "fictional_email") ?? `${local}@rytm.test`;
      const storedSource = sourceLabel(textField(timeline, "qr_id") ?? qrId);
      setPhase({ name: "done", email, source: storedSource, restarted });
    } catch (error) {
      if (error instanceof DemoClientError && error.code === "email_taken") {
        setFormError(error.message);
      } else {
        setFormError(userFacingError(error));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const address = previewAddress(localPart);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <p className="text-[11px] tracking-[0.28em] text-muted uppercase">Rytm</p>
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
          {phase.restarted ? (
            <p className="mb-6 border-l-2 border-rose pl-4 text-sm leading-relaxed" role="status">
              Demonstrationen har startats om. Du börjar en ny resa.
            </p>
          ) : null}
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
              setFormError(null);
            }}
            aria-invalid={formError ? true : undefined}
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
                setFormError(null);
              }}
            />
            <span>Jag vill få ett simulerat lanseringsbesked i den här demon.</span>
          </label>
          {formError ? (
            <p className="mt-4 text-sm text-rose" role="alert">
              {formError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="mt-8 min-h-12 w-full cursor-pointer rounded-full bg-rose px-8 text-white disabled:cursor-default disabled:opacity-50"
          >
            {submitting ? "Sparar…" : "Gå med på väntelistan"}
          </button>
          <p className="mt-6 text-sm text-muted">Källa: {source}</p>
        </form>
      ) : null}
      {phase.name === "done" ? (
        <section className="mt-10">
          {phase.restarted ? (
            <p className="mb-6 border-l-2 border-rose pl-4 text-sm leading-relaxed" role="status">
              Demonstrationen har startats om. Din anmälan gäller den nya omgången.
            </p>
          ) : null}
          <h1 className="font-serif text-4xl leading-tight tracking-[-0.03em]">Du är med på väntelistan.</h1>
          <p className="mt-4 leading-relaxed text-muted">
            Din registrering har nu skapat en händelse i Rytms demonstrationssystem.
          </p>
          <dl className="mt-8 grid gap-4 border-t border-line pt-6 text-sm">
            <div>
              <dt className="text-muted">Testadress</dt>
              <dd className="mt-1 text-base">{phase.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Källa</dt>
              <dd className="mt-1 text-base">{phase.source}</dd>
            </div>
            <div>
              <dt className="text-muted">Status</dt>
              <dd className="mt-1 text-base">På väntelistan</dd>
            </div>
          </dl>
          <p className="mt-8 leading-relaxed">
            Nästa steg i demonstrationen blir ett simulerat lanseringsbesked och kontoregistrering.
          </p>
        </section>
      ) : null}
    </main>
  );
}
