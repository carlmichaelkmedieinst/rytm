export function PresenterScreen({ url, svg }: { url: string | null; svg: string | null }) {
  return (
    <main
      className={`mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-12 px-8 py-16 ${
        url ? "lg:flex-row lg:justify-between lg:gap-16" : ""
      }`}
    >
      <div className={`max-w-xl text-center ${url ? "lg:text-left" : ""}`}>
        <p className="text-[11px] tracking-[0.28em] text-muted uppercase">Rytm</p>
        <h1 className="mt-6 font-serif text-5xl leading-none tracking-[-0.04em] sm:text-7xl lg:text-8xl">
          SKAFFA RYTM.
        </h1>
        <p className="mt-6 text-xl leading-snug text-ink sm:text-2xl">
          Skanna QR-koden och följ din egen kundresa.
        </p>
        {url ? (
          <p className="mt-8 break-all text-sm leading-relaxed text-muted">{url}</p>
        ) : (
          <p className="mt-8 max-w-md text-base leading-relaxed text-ink" role="status">
            Ingen publik https-adress är angiven, så vi visar ingen QR-kod. En localhost-adress går inte att
            skanna från en telefon.
          </p>
        )}
      </div>
      {url && svg ? (
        <div className="w-[min(78vw,34rem)] lg:w-[min(52vh,36rem)]">
          <div
            className="bg-white p-3 shadow-[0_0_0_1px_rgba(58,34,48,0.08)] sm:p-4 [&_svg]:h-auto [&_svg]:w-full"
            role="img"
            aria-label="QR-kod till Rytms demonstration"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <a
            className="mt-4 block text-center text-sm text-muted underline decoration-line underline-offset-4 hover:text-ink"
            href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
            download="rytm-qr.svg"
          >
            Ladda ner QR-kod
          </a>
        </div>
      ) : null}
    </main>
  );
}
