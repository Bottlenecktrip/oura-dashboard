import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function SectionHeader({ eyebrow, title, right }: { eyebrow: string; title: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function Stat({
  label, value, unit, color, sub,
}: { label: string; value: ReactNode; unit?: string; color?: string; sub?: string }) {
  return (
    <div className="flex flex-col">
      <div className="text-2xl font-semibold tnum leading-none" style={color ? { color } : undefined}>
        {value}
        {unit ? <span className="text-sm font-medium dim ml-0.5">{unit}</span> : null}
      </div>
      <div className="text-[11px] uppercase tracking-wider dim mt-1.5">{label}</div>
      {sub ? <div className="text-[11px] faint mt-0.5">{sub}</div> : null}
    </div>
  );
}

export function ScoreRing({
  value, size = 132, stroke = 11, color, caption,
}: { value: number | null; size?: number; stroke?: number; color: string; caption?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = value == null ? 0 : Math.max(0, Math.min(100, value)) / 100;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold tnum" style={{ color }}>{value ?? "—"}</div>
        {caption ? <div className="text-[11px] uppercase tracking-wider dim mt-0.5">{caption}</div> : null}
      </div>
    </div>
  );
}

export function ZoomHint() {
  return (
    <span className="text-[11px] faint hidden sm:inline">
      drag to zoom · wheel to zoom · shift-drag to pan
    </span>
  );
}
