import type { ReactNode } from "react";
import {
  activeWindow,
  dash,
  formatPayload,
  formatSet,
  frequencyLabel,
  kpiLabel,
  shortenId,
  yesNo,
} from "@/lib/format";
import type { ExperimentGroup, Snapshot } from "@/lib/types";

export function InternalView({
  snapshot,
  busy,
  onAdvanceDay,
  onNextWindow,
  onDay7,
  onDay14,
  onGroup,
  onPermission,
  onReset,
}: {
  snapshot: Snapshot;
  busy: boolean;
  onAdvanceDay: () => void;
  onNextWindow: () => void;
  onDay7: () => void;
  onDay14: () => void;
  onGroup: (group: ExperimentGroup) => void;
  onPermission: (allowed: boolean) => void;
  onReset: () => void;
}) {
  const { settings, state, entries, workouts, events } = snapshot;
  const windowId = activeWindow(state.current_day);
  const training = entries.map((entry) => {
    const workout = workouts.find((item) => item.id === entry.workout_id);
    return {
      ...entry,
      simulatedDay: workout?.simulated_day ?? state.current_day,
    };
  });
  const nextWindowDisabled =
    busy || state.expected_next_workout_at == null || state.current_day >= state.expected_next_workout_at;

  return (
    <main className="mx-auto w-full max-w-[1180px] px-[clamp(1.25rem,4vw,4.5rem)] py-10">
      <div className="flex flex-col gap-8 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="font-serif text-4xl tracking-[-0.03em]">Intern experimentvy</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <TextButton onClick={onAdvanceDay}>
            +1 dag
          </TextButton>
          <TextButton disabled={nextWindowDisabled} onClick={onNextWindow}>
            Gå till nästa träningsfönster
          </TextButton>
          <TextButton disabled={busy || state.current_day >= 7} onClick={onDay7}>
            Gå till dag 7
          </TextButton>
          <TextButton disabled={busy || state.current_day >= 14} onClick={onDay14}>
            Gå till dag 14
          </TextButton>
        </div>
      </div>

      <div className="mt-10 grid gap-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div>
          <Section title="Användare">
            <dl className="grid grid-cols-2 gap-x-8">
              <Field label="Användare" value={shortenId(snapshot.userId)} />
              <Field label="training_frequency" value={frequencyLabel(settings.training_frequency)} />
              <Field label="notification_permission" value={yesNo(settings.notification_permission)} />
              <Field
                label="experiment_group"
                value={settings.experiment_group === "test" ? "Testgrupp" : "Kontrollgrupp"}
              />
            </dl>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <TextButton
                disabled={busy}
                pressed={settings.experiment_group === "test"}
                onClick={() => onGroup("test")}
              >
                Testgrupp
              </TextButton>
              <TextButton
                disabled={busy}
                pressed={settings.experiment_group === "control"}
                onClick={() => onGroup("control")}
              >
                Kontrollgrupp
              </TextButton>
              <TextButton
                disabled={busy}
                pressed={settings.notification_permission}
                onClick={() => onPermission(true)}
              >
                Notiser på
              </TextButton>
              <TextButton
                disabled={busy}
                pressed={!settings.notification_permission}
                onClick={() => onPermission(false)}
              >
                Notiser av
              </TextButton>
            </div>
          </Section>

          <Section title="Systemstatus">
            <dl className="grid grid-cols-2 gap-x-8">
              <Field label="current_day" value={String(state.current_day)} />
              <Field label="first_workout_completed" value={yesNo(state.first_workout_completed)} />
              <Field label="first_comparison_available" value={yesNo(state.first_comparison_available)} />
              <Field label="expected_next_workout_at" value={dash(state.expected_next_workout_at)} />
              <Field label="communication_active" value={yesNo(state.communication_active)} />
              <Field label="measurement_active" value={yesNo(state.measurement_active)} />
              <Field label="user_returned" value={yesNo(state.user_returned)} />
              <Field label="push_sent" value={yesNo(state.push_sent)} />
              <Field label="comparison_day" value={dash(state.comparison_day)} />
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Initial testlogik: 2 pass/vecka ger +3 dagar, 3 pass/vecka +2 dagar, 4 eller 5
              pass/vecka +1 dag från första passet. Det är inte validerat användarbeteende.
            </p>
          </Section>

          <Section title="Tidsfönster">
            <WindowRow
              active={windowId === "communicate"}
              title="Dag 0–7"
              detail="Kommunikation + observation"
            />
            <WindowRow
              active={windowId === "observe"}
              title="Dag 7–14"
              detail="Endast observation"
            />
            <WindowRow active={windowId === "final"} title="Dag 14" detail="Slutlig mätning" />
          </Section>

          <Section title="KPI">
            <p>Första jämförelse inom 14 dagar</p>
            <p
              className={`mt-3 font-serif text-4xl tracking-[-0.03em] ${
                kpiLabel(state) === "UPPNÅDD" ? "text-rose" : "text-ink"
              }`}
            >
              {kpiLabel(state)}
            </p>
          </Section>

          <button
            type="button"
            disabled={busy}
            onClick={onReset}
            className="cursor-pointer text-sm text-muted underline decoration-line underline-offset-4 disabled:opacity-50"
          >
            Återställ demo
          </button>
        </div>

        <div className="lg:max-h-[calc(100vh-11rem)] lg:overflow-auto lg:pr-2">
          <Section title="Träningsdata">
            {training.length === 0 ? (
              <p className="text-muted">Inga pass ännu.</p>
            ) : (
              <ol>
                {training.map((entry) => (
                  <li key={entry.id} className="border-t border-line py-4">
                    <p className="text-xs tracking-[0.14em] text-muted uppercase">
                      Dag {entry.simulatedDay}
                    </p>
                    <p className="mt-1 font-serif text-2xl">{entry.exercise_name}</p>
                    <p className="mt-1">{formatSet(entry)}</p>
                  </li>
                ))}
              </ol>
            )}
          </Section>

          <Section title="Händelselogg">
            {events.length === 0 ? (
              <p className="text-muted">Inga händelser ännu.</p>
            ) : (
              <ol>
                {events.map((event) => {
                  const payload = formatPayload(event.payload);
                  return (
                    <li key={event.id} className="border-t border-line py-4">
                      <p className="text-xs tracking-[0.14em] text-muted uppercase">
                        Dag {event.simulated_day}
                      </p>
                      <p className="mt-1">{event.event_name}</p>
                      {payload ? <p className="mt-1 text-sm text-muted">{payload}</p> : null}
                    </li>
                  );
                })}
              </ol>
            )}
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xs tracking-[0.16em] text-muted uppercase">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-line py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}

function WindowRow({
  active,
  title,
  detail,
}: {
  active: boolean;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-line py-3">
      <div>
        <p className={active ? "text-ink" : "text-muted"}>{title}</p>
        <p className="text-sm text-muted">{detail}</p>
      </div>
      {active ? <p className="text-xs tracking-[0.14em] text-rose uppercase">Nu</p> : null}
    </div>
  );
}

function TextButton({
  children,
  onClick,
  disabled,
  pressed,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={pressed}
      onClick={onClick}
      className={`cursor-pointer disabled:cursor-default disabled:opacity-40 ${
        pressed ? "text-rose" : "text-ink"
      }`}
    >
      {children}
    </button>
  );
}
