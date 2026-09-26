type View = "product" | "internal";

export function AppHeader({
  view,
  onView,
}: {
  view: View;
  onView: (view: View) => void;
}) {
  return (
    <header className="flex items-center justify-between border-b border-line px-[clamp(1.25rem,4vw,4.5rem)] py-5">
      <p className="font-serif text-sm tracking-[0.28em]">RYTM</p>
      <div className="flex items-center gap-4 text-sm">
        <button
          type="button"
          aria-pressed={view === "product"}
          onClick={() => onView("product")}
          className={`cursor-pointer ${view === "product" ? "text-ink" : "text-muted"}`}
        >
          Produkt
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
          Internt
        </button>
      </div>
    </header>
  );
}
