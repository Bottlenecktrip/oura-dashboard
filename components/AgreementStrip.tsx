"use client";
import { useState } from "react";
import raw from "@/lib/compare-data.json";

type Pair = { date: string; oura: number; polar: number };
type CompareMetric = {
  key: string; label: string; unit: string;
  days: Pair[]; n: number;
  oura_avg: number; polar_avg: number; consensus: number;
  mad: number; tolerance: number;
  confidence: "high" | "medium" | "low";
  note?: string | null;
};
type CompareData = { polar_present: boolean; nights_compared: number; metrics: CompareMetric[] };

const DATA = raw as unknown as CompareData;

const CONF_COLOR = { high: "var(--green)", medium: "var(--yellow)", low: "var(--red)" };
const SHORT: Record<string, string> = {
  sleep_total_h: "Sleep", deep_h: "Deep", rem_h: "REM", light_h: "Light",
  sleep_score: "Score", avg_hrv: "HRV", resting_hr: "RHR", avg_breath: "Breath",
};

const fmt = (v: number, unit: string) =>
  unit === "h" ? `${v}h` : unit === "/100" ? `${v}` : `${v}${unit ? " " + unit : ""}`;

export default function AgreementStrip() {
  const [open, setOpen] = useState(false);

  if (!DATA.polar_present) return null; // nothing until Polar is connected

  if (DATA.metrics.length === 0) {
    return (
      <div className="card px-4 py-2.5 mb-5 flex items-center gap-2.5 text-xs dim">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--yellow)" }} />
        Polar connected — wear both devices to sleep and the night-vs-night accuracy check appears here.
      </div>
    );
  }

  return (
    <div className="card mb-5 overflow-hidden">
      <button onClick={() => setOpen(!open)}
              className="w-full flex items-center gap-x-4 gap-y-1.5 flex-wrap px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors">
        <span className="eyebrow shrink-0">Device check · sleep only</span>
        {DATA.metrics.map((m) => (
          <span key={m.key} className="flex items-center gap-1.5 text-xs"
                title={`${m.label}: Oura ${fmt(m.oura_avg, m.unit)} vs Polar ${fmt(m.polar_avg, m.unit)} — avg gap ${fmt(m.mad, m.unit)} over ${m.n} night${m.n > 1 ? "s" : ""} (${m.confidence} confidence)`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: CONF_COLOR[m.confidence] }} />
            <span className="dim">{SHORT[m.key] ?? m.label}</span>
            <span className="tnum">Δ{fmt(m.mad, m.unit)}</span>
          </span>
        ))}
        <span className="ml-auto text-[11px] faint shrink-0">
          {DATA.nights_compared} night{DATA.nights_compared !== 1 ? "s" : ""} · {open ? "hide" : "details"}
        </span>
      </button>

      {open && (
        <div className="border-t border-white/10 px-4 py-3 grid gap-2 sm:grid-cols-2">
          {DATA.metrics.map((m) => (
            <div key={m.key} className="text-xs border border-white/10 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: CONF_COLOR[m.confidence] }} />
                <span className="font-semibold">{m.label}</span>
                <span className="ml-auto faint capitalize">{m.confidence} confidence</span>
              </div>
              <div className="flex gap-4 tnum">
                <span><span className="dim">Oura</span> {fmt(m.oura_avg, m.unit)}</span>
                <span><span className="dim">Polar</span> {fmt(m.polar_avg, m.unit)}</span>
                <span style={{ color: "var(--green)" }}><span className="dim">Best est.</span> {fmt(m.consensus, m.unit)}</span>
              </div>
              <div className="mt-1.5 space-y-0.5">
                {m.days.slice(-5).map((d) => (
                  <div key={d.date} className="flex gap-3 tnum faint">
                    <span className="w-12">{d.date.slice(5)}</span>
                    <span>O {fmt(d.oura, m.unit)}</span>
                    <span>P {fmt(d.polar, m.unit)}</span>
                  </div>
                ))}
              </div>
              {m.note && <div className="faint mt-1.5">{m.note}</div>}
            </div>
          ))}
          <p className="faint text-[11px] sm:col-span-2">
            Compared only on nights both devices recorded real sleep — daytime data is excluded since the
            watch is worn only at night. Where confidence is high, trust the number; where it&apos;s low, trust
            the trend and the consensus estimate.
          </p>
        </div>
      )}
    </div>
  );
}
