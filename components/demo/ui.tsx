import type { ReactNode } from "react";

export function Tag({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "rose" }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-[10px] tracking-[0.16em] uppercase ${
        tone === "rose" ? "border-rose text-rose" : "border-line text-muted"
      }`}
    >
      {children}
    </span>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[0.84em] tracking-normal">{children}</span>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[11px] tracking-[0.18em] text-muted uppercase">{children}</p>;
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="cursor-pointer rounded-full bg-rose px-8 py-3 text-white disabled:cursor-default disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function DemoControl({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="cursor-pointer border border-dashed border-muted/50 px-4 py-2 text-sm text-muted transition-colors hover:border-rose hover:text-rose disabled:cursor-default disabled:opacity-50"
    >
      <span className="mr-2 text-[10px] tracking-[0.16em] uppercase">Demokontroll</span>
      {children}
    </button>
  );
}
