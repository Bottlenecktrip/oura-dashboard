// ---------------------------------------------------------------------------
// KeyNumbers — "Your key numbers, explained"
//
// One tile per important metric. Each tile answers, in order:
//   1. WHAT is this?          (name + the everyday question it answers)
//   2. WHERE am I?            (big value + colored verdict word)
//   3. WHERE SHOULD I be?     (range bar: shaded healthy zone + a dot = you)
//   4. SO WHAT?               (one personal comment + why the metric matters)
//
// Values come from your latest night (lib/data.ts); what each metric means
// and how it's judged lives in lib/explain.ts.
// ---------------------------------------------------------------------------
import { data, latest } from "@/lib/data";
import { EXPLAIN, TONE_COLOR, type MetricExplain } from "@/lib/explain";
import { Card, SectionHeader } from "./ui";

/** The horizontal range bar: gray track, tinted "healthy" zone, white dot = you. */
function RangeBar({ m, value }: { m: MetricExplain; value: number }) {
  // Convert a metric value to a 0-100% position along the bar.
  const pos = (v: number) =>
    Math.max(0, Math.min(100, ((v - m.barMin) / (m.barMax - m.barMin)) * 100));
  return (
    <div className="mt-2.5">
      <div className="relative h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
        {/* healthy zone */}
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${pos(m.goodLo)}%`,
            width: `${pos(m.goodHi) - pos(m.goodLo)}%`,
            background: "rgba(25,224,138,0.28)",
          }}
        />
        {/* you */}
        <div
          className="absolute w-3 h-3 rounded-full border-2 border-black -translate-x-1/2"
          style={{ left: `${pos(value)}%`, top: "-3px", background: "#fff" }}
        />
      </div>
      {/* scale labels: ends + the healthy zone, so the bar reads without guessing */}
      <div className="relative text-[10px] faint tnum h-4 mt-1">
        <span className="absolute left-0">{m.barMin}{m.unit}</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${(pos(m.goodLo) + pos(m.goodHi)) / 2}%`, color: "var(--green)" }}>
          healthy {m.goodLo}–{m.goodHi}{m.unit}
        </span>
        <span className="absolute right-0">{m.barMax}{m.unit}</span>
      </div>
    </div>
  );
}

/** Pull the latest real value for each metric key out of the exported data. */
function currentValues(): Record<string, number | null> {
  // most recent night that actually has a score (skips unworn nights)
  const night = latest(data.nights.filter((n) => n.score != null));
  if (!night) return {};
  const total = night.total_sleep_h || 0;
  const pct = (part: number) => (total > 0 ? (part / total) * 100 : null);
  return {
    sleep_total_h: night.total_sleep_h ?? null,
    deep_pct: pct(night.deep_h),
    rem_pct: pct(night.rem_h),
    sleep_efficiency: night.efficiency ?? null,
    resting_hr: night.lowest_hr ?? null,
    avg_hrv: night.avg_hrv ?? null,
    avg_breath: night.avg_breath ?? null,
    spo2_avg: night.spo2_avg ?? null,
  };
}

export default function KeyNumbers() {
  const values = currentValues();
  const night = latest(data.nights.filter((n) => n.score != null));

  return (
    <Card className="lg:col-span-2">
      <SectionHeader
        eyebrow="Learn your data"
        title="Your key numbers, explained"
        right={night ? <span className="text-[11px] faint">from your latest night</span> : undefined}
      />
      <div className="grid sm:grid-cols-2 gap-3">
        {EXPLAIN.map((m) => {
          const v = values[m.key];
          if (v == null) return null; // metric not available -> skip the tile
          const verdict = m.judge(v);
          const color = TONE_COLOR[verdict.tone];
          return (
            <div key={m.key} className="border border-white/10 rounded-xl p-3.5">
              {/* 1. what is this */}
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-[11px] faint italic">&ldquo;{m.question}&rdquo;</div>
                </div>
                {/* 2. where am I */}
                <div className="text-right shrink-0">
                  <div className="text-xl font-bold tnum" style={{ color }}>
                    {m.unit === "h" ? v.toFixed(1) : Math.round(v * 10) / 10}
                    <span className="text-xs font-medium dim ml-0.5">{m.unit}</span>
                  </div>
                  <div className="text-[11px] font-semibold" style={{ color }}>{verdict.word}</div>
                </div>
              </div>
              {/* 3. where should I be */}
              <RangeBar m={m} value={v} />
              {/* 4. so what */}
              <p className="text-xs mt-2" style={{ color: "var(--txt)" }}>{verdict.comment}</p>
              <p className="text-[11px] faint mt-1">{m.why}</p>
            </div>
          );
        })}
      </div>
      <p className="faint text-xs mt-4">
        The white dot is you; the green band is the healthy range. HRV is personal — judge it
        against your own past nights, not other people. None of this is medical advice.
      </p>
    </Card>
  );
}
