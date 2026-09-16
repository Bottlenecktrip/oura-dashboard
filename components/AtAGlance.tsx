"use client";
import { RingChart } from "@/components/charts/ring-chart";
import { Ring } from "@/components/charts/ring";
import { data, scoreColor, scoreWord, latest } from "@/lib/data";
import { Card, SectionHeader } from "./ui";

export default function AtAGlance() {
  const sleep = latest(data.nights.filter((n) => n.score != null))?.score ?? null;
  const ready = latest(data.readiness)?.score ?? null;
  const act = latest(data.activity)?.score ?? null;

  // innermost -> outermost. Bklit draws index 0 innermost.
  const rings = [
    { label: "Activity", value: act ?? 0, maxValue: 100, color: scoreColor(act) },
    { label: "Readiness", value: ready ?? 0, maxValue: 100, color: scoreColor(ready) },
    { label: "Sleep", value: sleep ?? 0, maxValue: 100, color: scoreColor(sleep) },
  ];

  const rows = [
    { label: "Sleep", v: sleep, hint: "how well you slept last night" },
    { label: "Readiness", v: ready, hint: "how recovered you are today" },
    { label: "Activity", v: act, hint: "how much you moved" },
  ];

  return (
    <Card className="lg:col-span-2">
      <SectionHeader eyebrow="At a glance" title="How you're doing" />
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
          <RingChart data={rings} size={180} strokeWidth={13} ringGap={6} baseInnerRadius={42}>
            {rings.map((r, i) => (
              <Ring key={r.label} index={i} color={r.color} animate={false} />
            ))}
          </RingChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-3xl font-bold tnum leading-none" style={{ color: scoreColor(sleep) }}>
              {sleep ?? "—"}
            </div>
            <div className="text-[10px] uppercase tracking-wider dim mt-1">Sleep</div>
          </div>
        </div>

        <div className="grid gap-3.5 w-full">
          {rows.map((r) => {
            const c = scoreColor(r.v);
            return (
              <div key={r.label} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{r.label}</div>
                  <div className="text-[11px] faint">{r.hint}</div>
                </div>
                <div className="text-2xl font-bold tnum" style={{ color: c }}>{r.v ?? "—"}</div>
                <div className="text-sm w-28 text-right" style={{ color: c }}>{scoreWord(r.v)}</div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="faint text-xs mt-4">
        Each ring fills toward 100. Green is optimal, yellow is okay, red means pay attention.
        The number in the middle is last night&apos;s sleep — your biggest lever.
      </p>
    </Card>
  );
}
