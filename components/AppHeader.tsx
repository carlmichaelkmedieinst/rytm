import { t, type Locale } from "@/lib/i18n";

type View = "product" | "internal";

export function AppHeader({
  view,
  locale,
  onView,
  onLocale,
}: {
  view: View;
  locale: Locale;
  onView: (view: View) => void;
  onLocale: (locale: Locale) => void;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line px-[clamp(1.25rem,4vw,4.5rem)] py-5">
      <p className="font-serif text-sm tracking-[0.28em]">RYTM</p>
      <div className="flex items-center gap-6 sm:gap-8">
        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            aria-pressed={view === "product"}
            onClick={() => onView("product")}
            className={`cursor-pointer ${view === "product" ? "text-ink" : "text-muted"}`}
          >
            {t(locale, "navProduct")}
          </button>
          <span className="text-line" aria-hidden="true">
            /
          </span>
          <button
            type="button"
            aria-pressed={view === "internal"}
            onClick={() => onView("internal")}
            className={`cursor-pointer ${view === "internal" ? "text-ink" : "text-muted"}`}
          >
            {t(locale, "navInternal")}
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            aria-pressed={locale === "sv"}
            onClick={() => onLocale("sv")}
            className={`cursor-pointer tracking-[0.08em] ${locale === "sv" ? "text-ink" : "text-muted"}`}
          >
            SV
          </button>
          <span className="text-line" aria-hidden="true">
            /
          </span>
          <button
            type="button"
            aria-pressed={locale === "en"}
            onClick={() => onLocale("en")}
            className={`cursor-pointer tracking-[0.08em] ${locale === "en" ? "text-ink" : "text-muted"}`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
