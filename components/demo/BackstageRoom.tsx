"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  activityTime,
  blueprintFor,
  decisionNote,
  eventDetail,
  eventRole,
  eventTitle,
  lifecycleLabel,
  type DemoEvent,
  type DemoParticipant,
} from "@/lib/demo/backstage-copy";
import { sourceLabel } from "@/lib/demo/source";

type Kpis = {
  visits: number;
  unique_participants: number;
  signups: number;
  accounts: number;
  activated: number;
};

type Snapshot = {
  generation_id: string;
  last_reset_at: string | null;
  kpis: Kpis;
  participants: DemoParticipant[];
};

const POLL_MS = 3000;

function numberField(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function textField(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function parseEvent(value: unknown): DemoEvent | null {
  const record = asRecord(value);
  const eventId = textField(record?.event_id);
  const eventName = textField(record?.event_name);
  const createdAt = textField(record?.created_at);
  if (!record || !eventId || !eventName || !createdAt) return null;
  const payload = asRecord(record.payload) ?? {};
  return {
    event_id: eventId,
    event_name: eventName,
    event_kind: textField(record.event_kind) ?? "Händelse",
    payload,
    created_at: createdAt,
  };
}

function parseParticipant(value: unknown): DemoParticipant | null {
  const record = asRecord(value);
  const participantId = textField(record?.participant_id);
  const createdAt = textField(record?.created_at);
  if (!record || !participantId || !createdAt) return null;
  const latest = asRecord(record.latest_event);
  const events = Array.isArray(record.events) ? record.events.flatMap((event) => parseEvent(event) ?? []) : [];
  return {
    participant_id: participantId,
    qr_id: textField(record.qr_id) ?? "unattributed",
    lifecycle_status: textField(record.lifecycle_status) ?? "visitor",
    fictional_email: textField(record.fictional_email),
    created_at: createdAt,
    updated_at: textField(record.updated_at) ?? createdAt,
    latest_event: latest
      ? {
          event_name: textField(latest.event_name) ?? "",
          event_kind: textField(latest.event_kind) ?? "",
          created_at: textField(latest.created_at) ?? createdAt,
        }
      : null,
    events,
  };
}

function parseSnapshot(value: unknown): Snapshot | null {
  const record = asRecord(value);
  const kpis = asRecord(record?.kpis);
  const generationId = textField(record?.generation_id);
  if (!record || !kpis || !generationId) return null;
  const participants = Array.isArray(record.participants)
    ? record.participants.flatMap((item) => parseParticipant(item) ?? [])
    : [];
  return {
    generation_id: generationId,
    last_reset_at: textField(record.last_reset_at),
    kpis: {
      visits: numberField(kpis.visits),
      unique_participants: numberField(kpis.unique_participants),
      signups: numberField(kpis.signups),
      accounts: numberField(kpis.accounts),
      activated: numberField(kpis.activated),
    },
    participants,
  };
}

function percent(numerator: number, denominator: number) {
  if (denominator <= 0) return "—";
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 1 }).format((numerator / denominator) * 100) + " %";
}

function clock(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "medium" }).format(date);
}

function shortClock(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("sv-SE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
}

export function BackstageRoom() {
  const [phase, setPhase] = useState<"checking" | "login" | "room">("checking");
  const [code, setCode] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const selectedRef = useRef<string | null>(null);

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  const load = useCallback(async () => {
    const response = await fetch("/api/demo/backstage", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
    if (response.status === 401 || response.status === 503) {
      setPhase("login");
      setSnapshot(null);
      if (response.status === 503) setLoginError(payload?.message ?? "Backstage är inte konfigurerat.");
      return;
    }
    if (!response.ok) {
      throw new Error(payload?.message ?? "Backstage kunde inte hämtas.");
    }
    const next = parseSnapshot(payload);
    if (!next) throw new Error("Backstage kunde inte läsas.");
    setSnapshot(next);
    setRefreshedAt(new Date().toISOString());
    setLiveError(null);
    setPhase("room");
    if (selectedRef.current && !next.participants.some((item) => item.participant_id === selectedRef.current)) {
      setSelectedId(null);
    }
  }, []);

  useEffect(() => {
    let stopped = false;
    let timer = 0;
    let inflight = false;

    async function tick() {
      if (stopped || inflight || document.hidden) return;
      inflight = true;
      try {
        await load();
      } catch (error) {
        if (!stopped) setLiveError(error instanceof Error ? error.message : "Backstage kunde inte hämtas.");
      } finally {
        inflight = false;
        if (!stopped) timer = window.setTimeout(tick, POLL_MS);
      }
    }

    function onVisible() {
      if (!document.hidden) void tick();
    }

    if (phase === "login") return;
    void tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load, phase]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setLoginError(null);
    try {
      const response = await fetch("/api/demo/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;
      if (!response.ok) {
        setLoginError(payload?.message ?? "Koden stämmer inte.");
        return;
      }
      setCode("");
      await load();
    } catch {
      setLoginError("Anslutningen avbröts. Försök igen.");
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    await fetch("/api/demo/session", { method: "DELETE" });
    setSnapshot(null);
    setSelectedId(null);
    setConfirmReset(false);
    setPhase("login");
  }

  async function resetDemo() {
    if (resetting) return;
    setResetting(true);
    try {
      const response = await fetch("/api/demo/reset", { method: "POST" });
      if (response.status === 401) {
        setPhase("login");
        setSnapshot(null);
        return;
      }
      if (!response.ok) {
        setLiveError("Demonstrationen kunde inte nollställas.");
        return;
      }
      setSelectedId(null);
      setConfirmReset(false);
      await load();
    } catch {
      setLiveError("Anslutningen avbröts. Försök igen.");
    } finally {
      setResetting(false);
    }
  }

  if (phase !== "room") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <p className="text-[11px] tracking-[0.28em] text-muted uppercase">Rytm</p>
        <h1 className="mt-6 font-serif text-5xl leading-none tracking-[-0.04em]">Backstage</h1>
        <p className="mt-4 leading-relaxed text-muted">
          Ange presentatörskoden för att se demonstrationens data. Koden skickas bara till servern.
        </p>
        {phase === "checking" ? <p className="mt-8 text-sm text-muted">Kontrollerar session…</p> : null}
        {liveError ? (
          <p className="mt-4 text-sm text-rose" role="alert">
            {liveError}
          </p>
        ) : null}
        {phase === "login" ? (
          <form className="mt-8" onSubmit={login}>
            <label className="block text-sm" htmlFor="presenter-code">
              Presentatörskod
            </label>
            <input
              id="presenter-code"
              type="password"
              autoComplete="current-password"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setLoginError(null);
              }}
              className="mt-2 min-h-12 w-full border border-line bg-white px-4 text-base outline-none"
            />
            {loginError ? (
              <p className="mt-4 text-sm text-rose" role="alert">
                {loginError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting || !code}
              className="mt-6 min-h-12 w-full cursor-pointer rounded-full bg-rose px-8 text-white disabled:cursor-default disabled:opacity-50"
            >
              {submitting ? "Kontrollerar…" : "Öppna backstage"}
            </button>
          </form>
        ) : null}
      </main>
    );
  }

  const participants = [...(snapshot?.participants ?? [])].sort((a, b) => activityTime(b).localeCompare(activityTime(a)));
  const selected = participants.find((item) => item.participant_id === selectedId) ?? null;
  const kpis = snapshot?.kpis;

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8 lg:px-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] tracking-[0.28em] text-muted uppercase">Rytm</p>
          <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em]">Backstage</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Demonstrationsdata från den här omgången. Inte ett verkligt kampanjresultat.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted" role="status">
            <span className="mr-2 inline-block size-2 rounded-full bg-rose" aria-hidden="true" />
            Live · {refreshedAt ? shortClock(refreshedAt) : "väntar"}
          </p>
          <a href="/demo" className="min-h-11 rounded-full border border-line px-5 py-2 text-sm">
            Visa QR-kod
          </a>
          <button type="button" className="min-h-11 cursor-pointer text-sm text-muted" onClick={() => void logout()}>
            Logga ut
          </button>
        </div>
      </header>

      {liveError ? (
        <p className="mt-6 text-sm text-rose" role="alert">
          {liveError}
        </p>
      ) : null}

      {kpis ? (
        <section className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4" aria-label="Nyckeltal">
          <Metric label="Besök" value={String(kpis.visits)} hint="Registrerade besök" />
          <Metric label="Unika deltagare" value={String(kpis.unique_participants)} hint="Unika deltagare" />
          <Metric label="Väntelista" value={String(kpis.signups)} hint="Anmälningar" />
          <Metric label="Konton" value={String(kpis.accounts)} hint="Skapade konton" />
          <Metric label="Aktiverade" value={String(kpis.activated)} hint="Aktiverade deltagare" />
          <Metric label="Väntelista / besök" value={percent(kpis.signups, kpis.visits)} hint="väntelista / besök" />
          <Metric label="Konton / väntelista" value={percent(kpis.accounts, kpis.signups)} hint="konton / väntelista" />
          <Metric label="Aktiverade / konton" value={percent(kpis.activated, kpis.accounts)} hint="aktiverade / konton" />
        </section>
      ) : null}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <section>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-3xl">Deltagare</h2>
            <button
              type="button"
              className="cursor-pointer text-sm text-rose"
              onClick={() => setConfirmReset(true)}
            >
              Nollställ demo
            </button>
          </div>
          {confirmReset ? (
            <div className="mt-4 border border-rose px-4 py-4" role="alertdialog" aria-labelledby="reset-title">
              <h3 id="reset-title" className="font-serif text-2xl">
                Nollställ demo
              </h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                <li>Alla deltagare, besök och händelser i demonstrationen rensas.</li>
                <li>Produktprototypens data påverkas inte.</li>
                <li>Pågående deltagarsessioner blir inaktuella.</li>
              </ul>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  disabled={resetting}
                  className="min-h-11 cursor-pointer rounded-full bg-rose px-5 text-sm text-white disabled:opacity-50"
                  onClick={() => void resetDemo()}
                >
                  {resetting ? "Nollställer…" : "Nollställ"}
                </button>
                <button type="button" className="min-h-11 cursor-pointer px-3 text-sm" onClick={() => setConfirmReset(false)}>
                  Avbryt
                </button>
              </div>
            </div>
          ) : null}
          {participants.length === 0 ? (
            <div className="mt-6 border border-line px-6 py-10">
              <h3 className="font-serif text-3xl">Inga deltagare ännu.</h3>
              <p className="mt-3 leading-relaxed text-muted">Visa QR-koden och låt deltagarna starta sin resa.</p>
              <a href="/demo" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-rose px-6 text-white">
                Visa QR-kod
              </a>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto border border-line">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="text-[11px] tracking-[0.14em] text-muted uppercase">
                  <tr>
                    <th className="px-4 py-3 font-normal">Deltagare</th>
                    <th className="px-4 py-3 font-normal">Källa</th>
                    <th className="px-4 py-3 font-normal">Start</th>
                    <th className="px-4 py-3 font-normal">Status</th>
                    <th className="px-4 py-3 font-normal">Senaste</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => {
                    const active = participant.participant_id === selectedId;
                    return (
                      <tr
                        key={participant.participant_id}
                        className={active ? "bg-blush" : "cursor-pointer"}
                        onClick={() => setSelectedId(participant.participant_id)}
                      >
                        <td className="border-t border-line px-4 py-3">
                          <button type="button" className="cursor-pointer text-left">
                            {participant.fictional_email ?? "Ej registrerad"}
                          </button>
                        </td>
                        <td className="border-t border-line px-4 py-3">{sourceLabel(participant.qr_id)}</td>
                        <td className="border-t border-line px-4 py-3">{clock(participant.created_at)}</td>
                        <td className="border-t border-line px-4 py-3">{lifecycleLabel(participant.lifecycle_status)}</td>
                        <td className="border-t border-line px-4 py-3">
                          {participant.latest_event
                            ? `${eventTitle(participant.latest_event.event_name)} · ${clock(participant.latest_event.created_at)}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="border border-line px-5 py-5">
          {selected ? <ParticipantDetail participant={selected} /> : (
            <div>
              <h2 className="font-serif text-3xl">Tidslinje</h2>
              <p className="mt-3 leading-relaxed text-muted">Välj en deltagare för att se resan och automationens beslut.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-cream px-4 py-4">
      <p className="text-[11px] tracking-[0.14em] text-muted uppercase">{label}</p>
      <p className="mt-2 font-serif text-4xl leading-none">{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function ParticipantDetail({ participant }: { participant: DemoParticipant }) {
  const blueprint = blueprintFor(participant);
  const events = participant.events;
  return (
    <div>
      <p className="text-[11px] tracking-[0.16em] text-muted uppercase">{lifecycleLabel(participant.lifecycle_status)}</p>
      <h2 className="mt-2 font-serif text-3xl">{participant.fictional_email ?? "Ej registrerad"}</h2>
      <p className="mt-2 text-sm text-muted">{sourceLabel(participant.qr_id)}</p>
      <ol className="mt-6 space-y-4">
        {events.map((event, index) => {
          const note = decisionNote(index > 0 ? events[index - 1] : null, event);
          const detail = eventDetail(event);
          return (
            <li key={event.event_id} className="border-t border-line pt-4">
              {note ? <p className="mb-3 text-sm leading-relaxed text-ink">{note}</p> : null}
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{eventTitle(event.event_name)}</p>
                <p className="text-xs tracking-[0.12em] text-muted uppercase">
                  {event.event_kind} · {eventRole(event.event_name)}
                </p>
              </div>
              <p className="mt-1 text-xs text-muted">{clock(event.created_at)}</p>
              {detail ? <p className="mt-2 text-sm leading-relaxed">{detail}</p> : null}
            </li>
          );
        })}
      </ol>
      <div className="mt-8 grid gap-4 border-t border-line pt-5">
        <h3 className="text-[11px] tracking-[0.16em] text-muted uppercase">Service blueprint</h3>
        <BlueprintLine label="Frontstage" text={blueprint.front} />
        <BlueprintLine label="Backstage" text={blueprint.back} />
        <BlueprintLine label="Data" text={blueprint.data} />
      </div>
    </div>
  );
}

function BlueprintLine({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.14em] text-muted uppercase">{label}</p>
      <p className="mt-1 text-sm leading-relaxed">{text}</p>
    </div>
  );
}
