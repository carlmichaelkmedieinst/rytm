import type { Metadata } from "next";
import { ParticipantJourney } from "@/components/demo/ParticipantJourney";
import { sourceFromParam } from "@/lib/demo/source";

export const metadata: Metadata = {
  title: "Rytm · Väntelista",
};

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function ResaPage({ searchParams }: PageProps<"/demo/resa">) {
  const query = await searchParams;
  const source = sourceFromParam(param(query.qr_id));

  if (!source) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <p className="text-[11px] tracking-[0.28em] text-muted uppercase">Rytm</p>
        <h1 className="mt-10 font-serif text-4xl leading-tight tracking-[-0.03em]">Ogiltig QR-källa</h1>
        <p className="mt-4 leading-relaxed text-muted">Länken saknar en giltig källa. Skanna QR-koden igen.</p>
      </main>
    );
  }

  return <ParticipantJourney qrId={source.qrId} source={source.label} />;
}
