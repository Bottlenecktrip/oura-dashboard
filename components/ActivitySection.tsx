"use client";
import dynamic from "next/dynamic";
import { C, data, scoreColor, latest } from "@/lib/data";
import { Card, ScoreRing, Stat, SectionHeader } from "./ui";

const ZoneChart = dynamic(() => import("./ZoneChart"), {
  ssr: false,
  loading: () => <div style={{ height: 300 }} className="grid place-items-center faint text-sm">Loading chart…</div>,
});
const TrendChart = dynamic(() => import("./TrendChart"), {
  ssr: false,
  loading: () => <div style={{ height: 250 }} className="grid place-items-center faint text-sm">Loading chart…</div>,
});

const readyByDay: Record<string, number | null> =
  Object.fromEntries(data.readiness.map((r) => [r.day, r.score]));
const xOf = (d: string) => new Date(d + "T00:00:00").getTime();

// Oura has no native "strain" metric — derive a rough 0–21 load from real
// active calories + time spent at medium/high intensity. Labelled as estimated.
function strainOf(a: (typeof data.activity)[number]): number | null {
  if (!a) return null;
  const raw = (a.active_cal ?? 0) / 45 + (a.high_min ?? 0) * 0.4 + (a.medium_min ?? 0) * 0.06;
  return Math.min(21, Math.round(raw * 10) / 10);
}

export default function ActivitySection() {
  const last = latest(data.activity);
  const col = scoreColor(last?.score);
  const strain = strainOf(last!);

  const corr = [
    { label: "Active calories", color: C.yellow, axis: "y" as const,
      points: data.activity.map((a) => ({ x: xOf(a.day), y: a.active_cal })) },
    { label: "Readiness (next recovery)", color: C.green, axis: "y2" as const,
      points: data.activity.map((a) => ({ x: xOf(a.day), y: readyByDay[a.day] ?? null })) },
  ];

  return (
    <Card>
      <SectionHeader eyebrow="Strain · Activity" title="Daytime load & zones" />
      <div className="flex items-center gap-5">
        <ScoreRing value={last?.score ?? null} color={col} size={116} caption="Activity" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Stat label="Daily strain" value={strain ?? "—"} unit="/21" sub="estimated from HR + load" color={C.orange} />
          <Stat label="Steps" value={last?.steps?.toLocaleString() ?? "—"} />
          <Stat label="Active cal" value={last?.active_cal ?? "—"} unit="kcal" />
          <Stat label="Inactivity alerts" value={last?.inactivity_alerts ?? "—"} />
        </div>
      </div>

      <div className="mt-5">
        <div className="eyebrow mb-2">Heart-rate zones · last days</div>
        <ZoneChart zones={data.hr_zones} />
        <p className="faint text-xs mt-2">
          Minutes per HR zone (Z1 easy → Z5 max), derived from real all-day heart-rate samples
          against your estimated max HR of {data.max_hr} bpm. Minutes are approximate (~5-min sampling).
        </p>
      </div>

      <div className="mt-6">
        <div className="eyebrow mb-2">Strain vs recovery</div>
        <TrendChart series={corr} y2Label="readiness" unit="kcal" height={230} />
        <p className="faint text-xs mt-2">
          Daytime active calories (left) against readiness (right) — watch whether your hardest
          days are followed by weaker recovery.
        </p>
      </div>
    </Card>
  );
}
