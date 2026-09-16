"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import {
  C, data, fmtHrs, fmtClock, fmtDay, scoreColor, scoreWord, STAGE_COLOR,
} from "@/lib/data";
import { reviewForNight } from "@/lib/insights";
import DailyReview from "./DailyReview";
import { Card, ScoreRing, Stat, SectionHeader, ZoomHint } from "./ui";

const SleepNightChart = dynamic(() => import("./SleepNightChart"), {
  ssr: false,
  loading: () => <div style={{ height: 352 }} className="grid place-items-center faint text-sm">Loading chart…</div>,
});

const detailed = data.nights.filter((n) => n.hypnogram.length > 0);
const NIGHTS = detailed.length ? detailed : data.nights;

export default function SleepHero() {
  const [idx, setIdx] = useState(NIGHTS.length - 1);
  const night = NIGHTS[idx];
  if (!night) return null;
  const col = scoreColor(night.score);
  const review = reviewForNight(night, data.nights);

  const stages: [string, number, string][] = [
    ["Deep", night.deep_h, STAGE_COLOR.deep],
    ["REM", night.rem_h, STAGE_COLOR.rem],
    ["Light", night.light_h, STAGE_COLOR.light],
    ["Awake", night.awake_h, STAGE_COLOR.awake],
  ];

  return (
    <Card className="lg:col-span-2">
      <SectionHeader
        eyebrow="Primary focus · Sleep"
        title="Last night"
        right={<ZoomHint />}
      />

      {/* score + key stats */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
        <div className="flex items-center gap-5">
          <ScoreRing value={night.score} color={col} caption="Sleep" />
          <div>
            <div className="text-lg font-semibold" style={{ color: col }}>{scoreWord(night.score)}</div>
            <div className="dim text-sm mt-0.5">{fmtDay(night.day)}</div>
            <div className="faint text-xs mt-1">
              {fmtClock(night.bedtime_start)} – {fmtClock(night.bedtime_end)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 sm:ml-auto">
          <Stat label="Total sleep" value={fmtHrs(night.total_sleep_h)} />
          <Stat label="Time in bed" value={fmtHrs(night.time_in_bed_h)} />
          <Stat label="Efficiency" value={night.efficiency ?? "—"} unit="%" />
          <Stat label="Lowest RHR" value={night.lowest_hr ?? "—"} unit="bpm" color={C.hr} />
          <Stat label="Avg HRV" value={night.avg_hrv ?? "—"} unit="ms" color={C.hrv} />
          <Stat label="Respiratory" value={night.avg_breath ? night.avg_breath.toFixed(1) : "—"} unit="/min" />
        </div>
      </div>

      {/* stage breakdown chips */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5">
        {stages.map(([name, h, c]) => (
          <div key={name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
            <span className="text-sm dim">{name}</span>
            <span className="text-sm font-medium tnum">{fmtHrs(h)}</span>
          </div>
        ))}
      </div>

      {/* the per-night written review */}
      <div className="mt-5">
        <DailyReview review={review} />
      </div>

      {/* night selector */}
      {NIGHTS.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scroll-x mt-5 pb-1">
          {NIGHTS.map((n, i) => (
            <button
              key={n.day}
              onClick={() => setIdx(i)}
              className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                i === idx ? "border-white/40 bg-white/5 text-white" : "border-white/10 dim hover:text-white"
              }`}
            >
              <span className="tnum" style={{ color: scoreColor(n.score) }}>{n.score ?? "—"}</span>
              <span className="ml-1.5">{fmtDay(n.day).replace(/^\w+, /, "")}</span>
            </button>
          ))}
        </div>
      )}

      {/* the zoomable hypnogram + HR + HRV */}
      <div className="mt-4">
        <SleepNightChart night={night} />
        <p className="faint text-xs mt-2">
          Hypnogram (sleep stages) with overnight heart rate and HRV. Drag across any window
          — e.g. the early-night deep-sleep dip — to zoom into minute-level detail.
        </p>
      </div>
    </Card>
  );
}
