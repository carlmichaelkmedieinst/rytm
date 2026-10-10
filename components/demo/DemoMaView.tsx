import type { ReactNode } from "react";
import { Code, Eyebrow, Tag } from "@/components/demo/ui";
import { Field, Section } from "@/components/InternalView";
import { formatPayload } from "@/lib/format";
import {
  EVENT_COPY,
  LIFECYCLE_STAGES,
  NEXT_ACTION_COPY,
  eventTag,
  journeyEvents,
  latestMovement,
  type MaProfile,
} from "@/lib/lifecycle";
import type { AppEvent, Snapshot } from "@/lib/types";

export function DemoMaView({ snapshot, profile }: { snapshot: Snapshot; profile: MaProfile }) {
  const events = journeyEvents(snapshot.events);

  return (
    <div>
      <p className="mb-10 border-l-2 border-rose pl-4 font-serif text-xl leading-snug">
        Vi slutar marknadsföra nästa steg när användaren redan har tagit det.
      </p>
      <Movement events={events} profile={profile} />
      <Profile profile={profile} />
      <Conditions profile={profile} />
      <EventLog events={events} />
      <Persistence />
    </div>
  );
}

function Movement({ events, profile }: { events: AppEvent[]; profile: MaProfile }) {
  const movement = latestMovement(events);
  const trigger = movement?.trigger ?? null;
  const copy = trigger ? EVENT_COPY[trigger.event_name] : null;
  const segmentUpdated = movement?.actions.some((event) => event.event_name === "segment_assigned") ?? false;

  return (
    <div className="mb-12 grid gap-px border border-line bg-line sm:grid-cols-2">
      <Card step="1" title="Event received">
        {trigger && copy ? (
          <>
            <p className="text-lg">
              <Code>{trigger.event_name}</Code>
            </p>
            <p className="mt-1 text-sm text-muted">{copy.title}</p>
            <div className="mt-3">
              <Tag>{eventTag(trigger.event_name)}</Tag>
            </div>
          </>
        ) : (
          <Waiting>Väntar på första eventet</Waiting>
        )}
      </Card>
      <Card step="2" title="Data stored">
        {trigger ? (
          <ul className="space-y-1 text-sm">
            {storedLines(trigger).map((line) => (
              <li key={line}>
                <Code>{line}</Code>
              </li>
            ))}
          </ul>
        ) : (
          <Waiting>Inget sparat ännu</Waiting>
        )}
      </Card>
      <Card step="3" title="Segment updated">
        {profile.segment ? (
          <>
            <p className="text-lg">
              <Code>{profile.segment}</Code>
            </p>
            {profile.location ? <p className="mt-1 text-sm text-muted">{profile.location} · ingen GPS</p> : null}
            <p className={`mt-3 text-xs tracking-[0.14em] uppercase ${segmentUpdated ? "text-rose" : "text-muted"}`}>
              {segmentUpdated ? "Uppdaterat av detta event" : "Oförändrat"}
            </p>
          </>
        ) : (
          <Waiting>Inget segment ännu</Waiting>
        )}
      </Card>
      <Card step="4" title="Next action">
        {profile.nextAction ? (
          <>
            <p className="text-lg">
              <Code>{profile.nextAction}</Code>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{NEXT_ACTION_COPY[profile.nextAction]}</p>
            {movement && movement.actions.length > 0 ? (
              <p className="mt-3 text-xs break-words text-muted">
                Automationen körde:{" "}
                {movement.actions.map((event, index) => (
                  <span key={event.id}>
                    {index > 0 ? ", " : null}
                    <Code>{event.event_name}</Code>
                  </span>
                ))}
              </p>
            ) : null}
          </>
        ) : (
          <Waiting>Väntar på waitlist_signup</Waiting>
        )}
      </Card>
    </div>
  );
}

function storedLines(event: AppEvent) {
  const lines = Object.entries(event.payload).map(([key, value]) => `${key} = ${String(value)}`);
  const state = EVENT_COPY[event.event_name]?.state;
  return state ? [...lines, state] : lines;
}

function Card({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return (
    <div className="bg-cream p-5">
      <Eyebrow>
        {step} · {title}
      </Eyebrow>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Waiting({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}

function Profile({ profile }: { profile: MaProfile }) {
  const stage = LIFECYCLE_STAGES.indexOf(profile.lifecycle as (typeof LIFECYCLE_STAGES)[number]);

  return (
    <Section title="Profil">
      <dl className="grid grid-cols-2 gap-x-8">
        <Field label="Identitet · email" value={<Value>{profile.email}</Value>} />
        <Field label="Segment · source_segment" value={<Value>{profile.segment}</Value>} />
        <Field label="Källa · qr_id" value={<Value>{profile.qrId}</Value>} />
        <Field label="Källa · utm_content" value={<Value>{profile.utmContent}</Value>} />
      </dl>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Consent label="launch_notification_consent" detail="Endast lanseringsnotis" value={profile.launchConsent} />
        <Consent label="marketing_consent" detail="Generell marknadsföring" value={profile.marketingConsent} />
      </div>

      <div className="mt-8">
        <p className="text-xs text-muted">Lifecycle stage · lifecycle_status</p>
        <ol className="mt-3 flex flex-wrap gap-2">
          {LIFECYCLE_STAGES.map((name, index) => (
            <li
              key={name}
              className={`px-3 py-1.5 text-sm ${
                index === stage
                  ? "bg-rose text-white"
                  : index < stage
                    ? "bg-blush text-ink"
                    : "border border-line text-muted"
              }`}
            >
              <Code>{name}</Code>
            </li>
          ))}
        </ol>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-8">
        <Field label="Senaste event" value={<Value>{profile.latestEvent?.event_name ?? null}</Value>} />
        <Field label="Nästa automation · next_action" value={<Value>{profile.nextAction}</Value>} />
      </dl>

      <div className={`mt-6 p-5 ${profile.kpi ? "bg-rose text-white" : "border border-line"}`}>
        <p className={`text-xs tracking-[0.14em] uppercase ${profile.kpi ? "text-white/80" : "text-muted"}`}>
          Activation KPI
        </p>
        <p className="mt-2">Synthetic user reached first meaningful comparison.</p>
        <p className="mt-2 font-serif text-3xl">{profile.kpi ? "true" : "false"}</p>
      </div>
    </Section>
  );
}

function Value({ children }: { children: string | null }) {
  return children ? <Code>{children}</Code> : <span className="text-muted">—</span>;
}

function Consent({ label, detail, value }: { label: string; detail: string; value: boolean | null }) {
  return (
    <div className="border border-line p-4">
      <p className="text-xs text-muted">{detail}</p>
      <p className="mt-1 text-sm">
        <Code>{label}</Code>
      </p>
      <p className={`mt-2 font-serif text-2xl ${value ? "text-rose" : "text-ink"}`}>
        {value == null ? "—" : value ? "Ja" : "Nej"}
      </p>
    </div>
  );
}

function Conditions({ profile }: { profile: MaProfile }) {
  const rows = [
    {
      name: "account_created?",
      evaluated: profile.lifecycle !== "visitor",
      value: profile.accountCreated,
      yes: "Konto kopplat till väntelisteprofilen (simulerad matchning på e-post)",
      no: `Kvar på väntelistan · next_action = ${profile.launchNotified ? "wait_for_account" : "wait_for_launch"}`,
    },
    {
      name: "first_workout_completed?",
      evaluated: profile.accountCreated,
      value: profile.firstWorkout,
      yes: "Första passet loggat · onboarding_help stoppas",
      no: "lifecycle_status = account_created · next_action = onboarding_help",
    },
    {
      name: "first_comparison_available?",
      evaluated: profile.firstWorkout,
      value: profile.firstComparison,
      yes: "lifecycle_status = activated · aktiveringskommunikation stoppad",
      no: "lifecycle_status = awaiting_comparison · next_action = wait_for_relevant_behavior",
    },
  ];

  return (
    <Section title="Villkor och förgrening">
      <ol>
        {rows.map((row) => (
          <li key={row.name} className="border-t border-line py-4">
            <div className="flex items-center justify-between gap-4">
              <Code>{row.name}</Code>
              <span
                className={`text-xs tracking-[0.14em] uppercase ${
                  !row.evaluated ? "text-muted" : row.value ? "text-rose" : "text-ink"
                }`}
              >
                {!row.evaluated ? "Ej utvärderat" : row.value ? "Ja" : "Nej"}
              </span>
            </div>
            <Branch label="Ja" text={row.yes} taken={row.evaluated && row.value} />
            <Branch label="Nej" text={row.no} taken={row.evaluated && !row.value} />
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Branch({ label, text, taken }: { label: string; text: string; taken: boolean }) {
  return (
    <p className={`mt-2 flex gap-3 text-sm ${taken ? "text-ink" : "text-muted/60"}`}>
      <span className={`w-12 shrink-0 whitespace-nowrap ${taken ? "text-rose" : ""}`}>{label} →</span>
      <span>{text}</span>
    </p>
  );
}

function EventLog({ events }: { events: AppEvent[] }) {
  return (
    <details className="mb-10 border-t border-line pt-4">
      <summary className="cursor-pointer text-xs tracking-[0.16em] text-muted uppercase">
        Händelselogg · {events.length} rader i tabellen events
      </summary>
      {events.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Inga händelser ännu.</p>
      ) : (
        <ol className="mt-4">
          {events.map((event) => {
            const payload = formatPayload(event.payload);
            return (
              <li key={event.id} className="border-t border-line py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Code>{event.event_name}</Code>
                  <span className="text-xs text-muted">
                    {new Date(event.created_at).toLocaleTimeString("sv-SE")} · {eventTag(event.event_name)}
                  </span>
                </div>
                {payload ? <p className="mt-1 text-xs break-words text-muted">{payload}</p> : null}
              </li>
            );
          })}
        </ol>
      )}
    </details>
  );
}

function Persistence() {
  return (
    <Section title="Sparat eller simulerat">
      <dl className="space-y-3 text-sm leading-relaxed">
        <div>
          <dt className="text-muted">Sparas i Supabase</dt>
          <dd>
            Alla events ovan i <Code>events</Code>, pass i <Code>workouts</Code> och <Code>workout_entries</Code>,
            status i <Code>user_state</Code>.
          </dd>
        </div>
        <div>
          <dt className="text-muted">Härleds från sparade events</dt>
          <dd>
            <Code>lifecycle_status</Code>, <Code>next_action</Code> och KPI.
          </dd>
        </div>
        <div>
          <dt className="text-muted">Simulerat</dt>
          <dd>Lanseringsmejl, matchning väntelista → konto och delning. Inga mejl eller API-anrop skickas.</dd>
        </div>
      </dl>
    </Section>
  );
}
