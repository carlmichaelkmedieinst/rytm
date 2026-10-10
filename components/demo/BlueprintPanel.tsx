import { Code, Tag } from "@/components/demo/ui";
import type { MaProfile } from "@/lib/lifecycle";

export function BlueprintPanel({ profile }: { profile: MaProfile }) {
  const links = [
    {
      step: "01",
      title: "Källa",
      line: (
        <>
          <Code>qr_id</Code> sparas vid <Code>waitlist_signup</Code>
        </>
      ),
      shown: profile.qrId != null,
      evidence: profile.qrId ? `qr_id = ${profile.qrId}` : null,
    },
    {
      step: "02",
      title: "Identitet",
      line: <>väntelista → konto är simulerad matchning</>,
      shown: profile.accountCreated,
      evidence: profile.accountCreated ? `account_created · match_key = email` : null,
    },
    {
      step: "03",
      title: "Beteende",
      line: (
        <>
          <Code>first_comparison_available</Code> når automationen som status
        </>
      ),
      shown: profile.firstComparison,
      evidence: profile.firstComparison ? `lifecycle_status = activated` : null,
    },
  ];

  return (
    <section className="border-t border-line px-[clamp(1.25rem,4vw,4.5rem)] py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="text-xs tracking-[0.18em] text-muted uppercase">Koppling till service blueprint</h2>
        <Tag>Demo-event · föreslagen modell</Tag>
      </div>
      <ol className="mt-8 grid gap-px border border-line bg-line md:grid-cols-3">
        {links.map((link) => (
          <li key={link.step} className={`p-6 ${link.shown ? "bg-blush" : "bg-cream"}`}>
            <p className={`text-xs tracking-[0.18em] uppercase ${link.shown ? "text-rose" : "text-muted"}`}>
              {link.step} · {link.title}
            </p>
            <p className="mt-3 text-lg leading-snug">{link.line}</p>
            <p className="mt-4 text-xs text-muted">
              {link.evidence ? (
                <>
                  Syns nu · <Code>{link.evidence}</Code>
                </>
              ) : (
                "Inte nått ännu i demon"
              )}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
