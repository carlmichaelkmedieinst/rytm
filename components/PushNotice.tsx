export function PushNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed top-5 left-1/2 z-30 w-[min(22.5rem,calc(100vw-2rem))] -translate-x-1/2 border border-line bg-white shadow-[0_16px_40px_rgba(58,34,48,0.08)]"
    >
      <div className="flex gap-4 p-4">
        <div className="w-1 shrink-0 bg-rose" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] tracking-[0.22em]">RYTM</p>
          <p className="mt-2 text-[15px] leading-snug">
            Nästa pass börjar där det förra slutade.
            <span className="mt-1 block">
              Fortsätt logga så kan Rytm börja visa din utveckling.
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Stäng"
          className="cursor-pointer text-lg leading-none text-muted"
        >
          ×
        </button>
      </div>
    </aside>
  );
}
