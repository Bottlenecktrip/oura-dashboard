"use client";
import dynamic from "next/dynamic";
import { C, data, scoreColor, scoreWord, latest } from "@/lib/data";
import { Card, ScoreRing, Stat, SectionHeader, ZoomHint } from "./ui";

const TrendChart = dynamic(() => import("./TrendChart"), {
  ssr: false,
  loading: () => <div style={{ height: 292 }} className="grid place-items-center faint text-sm">Loading chart…</div>,
});

const nightsByDay: Record<string, (typeof data.nights)[number]> =
  Object.fromEntries(data.nights.map((n) => [n.day, n]));
const xOf = (d: string) => new Date(d + "T00:00:00").getTime();

export default function ReadinessSection() {
  const days = data.readiness;
  const last = latest(days);
  const lastNight = last ? nightsByDay[last.day] : undefined;
  const col = scoreColor(last?.score);

  const tempDev = last?.temperature_deviation;
  const tempStr = tempDev == null ? "—" : `${tempDev > 0 ? "+" : ""}${tempDev.toFixed(1)}`;

  const series = [
    { label: "Readiness", color: C.green, axis: "y" as const,
      points: days.map((r) => ({ x: xOf(r.day), y: r.score })) },
    { label: "Resting HR", color: C.hr, axis: "y2" as const,
      points: days.map((r) => ({ x: xOf(r.day), y: nightsByDay[r.day]?.lowest_hr ?? null })) },
    { label: "HRV", color: C.hrv, axis: "y2" as const, dashed: true,
      points: days.map((r) => ({ x: xOf(r.day), y: nightsByDay[r.day]?.avg_hrv ?? null })) },
  ];

  return (
    <Card>
      <SectionHeader eyebrow="Recovery" title="Readiness" right={<ZoomHint />} />
      <div className="flex items-center gap-5">
        <ScoreRing value={last?.score ?? null} color={col} size={116} caption="Readiness" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Stat label="Recovery" value={scoreWord(last?.score)} />
          <Stat label="Body temp" value={tempStr} unit="°C" sub="vs your baseline" />
          <Stat label="Resting HR" value={lastNight?.lowest_hr ?? "—"} unit="bpm" color={C.hr} />
          <Stat label="Respiratory" value={lastNight?.avg_breath ? lastNight.avg_breath.toFixed(1) : "—"} unit="/min" />
        </div>
      </div>
      <div className="mt-5">
        <TrendChart series={series} y2Label="bpm / ms" unit="score" height={250} />
        <p className="faint text-xs mt-2">
          Readiness (left) against resting heart rate and HRV (right). Rising HRV with falling
          resting HR is the recovery signal to look for.
        </p>
      </div>
    </Card>
  );
}
