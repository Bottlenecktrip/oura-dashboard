// ---------------------------------------------------------------------------
// explain.ts — the "plain English" brain of the dashboard.
//
// Every important metric is described here in one place:
//   - what it actually is (no jargon)
//   - why you should care
//   - what a healthy range looks like for a young adult
//   - how to judge YOUR value (good / okay / attention)
//
// The UI reads from this registry, so if you ever want to reword something
// or tweak a range, you only edit this file.
// ---------------------------------------------------------------------------

export type Tone = "good" | "ok" | "bad";

export type Judgment = {
  tone: Tone;        // drives the color (green / yellow / red)
  word: string;      // short verdict shown next to the value ("Great", "Low"...)
  comment: string;   // one personal sentence about YOUR value
};

export type MetricExplain = {
  key: string;
  name: string;          // friendly name
  question: string;      // the everyday question this metric answers
  why: string;           // why it matters, one plain sentence
  unit: string;
  // The visual range bar: we draw from barMin..barMax and shade goodLo..goodHi
  barMin: number;
  barMax: number;
  goodLo: number;
  goodHi: number;
  // true  = "higher is better" (HRV)
  // false = "lower is better" (resting heart rate)
  // null  = "inside the band is best" (sleep duration, breathing)
  higherBetter: boolean | null;
  judge: (v: number) => Judgment;
};

const j = (tone: Tone, word: string, comment: string): Judgment => ({ tone, word, comment });

// Small helper for "inside the band is best" metrics.
function bandJudge(v: number, lo: number, hi: number, unit: string,
                   lowMsg: string, inMsg: string, highMsg: string): Judgment {
  if (v < lo) return j("bad", "Low", lowMsg);
  if (v <= hi) return j("good", "Good", inMsg);
  return j("ok", "High", highMsg);
}

export const EXPLAIN: MetricExplain[] = [
  {
    key: "sleep_total_h",
    name: "Time asleep",
    question: "Did I sleep enough?",
    why: "Total sleep is the single biggest factor in how you feel and perform. Adults need 7–9 hours.",
    unit: "h",
    barMin: 4, barMax: 11, goodLo: 7, goodHi: 9,
    higherBetter: null,
    judge: (v) =>
      v < 6   ? j("bad", "Too little", `${v.toFixed(1)}h is well short — your body didn't get the full repair cycle.`)
      : v < 7 ? j("ok", "A bit short", `${v.toFixed(1)}h is slightly under the 7h floor — try an earlier night.`)
      : v <= 9 ? j("good", "On target", `${v.toFixed(1)}h sits right in the healthy 7–9h window.`)
      : j("ok", "Long", `${v.toFixed(1)}h is longer than usual — fine sometimes, but often means you're catching up.`),
  },
  {
    key: "deep_pct",
    name: "Deep sleep",
    question: "Did my body recover?",
    why: "Deep sleep is when muscles repair and the immune system recharges. Aim for 13–20% of the night.",
    unit: "%",
    barMin: 0, barMax: 30, goodLo: 13, goodHi: 20,
    higherBetter: null,
    judge: (v) =>
      v < 10  ? j("bad", "Low", `${Math.round(v)}% deep is thin — a cool, dark room and no late alcohol help most.`)
      : v < 13 ? j("ok", "Slightly low", `${Math.round(v)}% is just under the ideal 13–20% band.`)
      : v <= 22 ? j("good", "Healthy", `${Math.round(v)}% deep — solid physical recovery.`)
      : j("good", "High", `${Math.round(v)}% is generous deep sleep — great recovery night.`),
  },
  {
    key: "rem_pct",
    name: "REM sleep",
    question: "Did my brain recharge?",
    why: "REM is when the brain files memories and processes emotion. Aim for roughly 20–25% of the night.",
    unit: "%",
    barMin: 0, barMax: 35, goodLo: 18, goodHi: 27,
    higherBetter: null,
    judge: (v) =>
      v < 15  ? j("bad", "Low", `${Math.round(v)}% REM is low — irregular wake times and late caffeine hit REM hardest.`)
      : v < 18 ? j("ok", "Slightly low", `${Math.round(v)}% is a touch under the sweet spot.`)
      : v <= 27 ? j("good", "Healthy", `${Math.round(v)}% REM — memory and mood well served.`)
      : j("ok", "High", `${Math.round(v)}% is high REM — often rebound after short nights.`),
  },
  {
    key: "sleep_efficiency",
    name: "Sleep efficiency",
    question: "Was my night restless?",
    why: "The share of your time in bed you were actually asleep. Above 85% means you fell asleep and stayed asleep.",
    unit: "%",
    barMin: 60, barMax: 100, goodLo: 85, goodHi: 100,
    higherBetter: true,
    judge: (v) =>
      v < 80  ? j("bad", "Restless", `${Math.round(v)}% — you spent a big chunk of the night awake in bed.`)
      : v < 85 ? j("ok", "A bit restless", `${Math.round(v)}% — slightly choppy; wind-down routine helps.`)
      : j("good", "Solid", `${Math.round(v)}% — you fell asleep and stayed asleep well.`),
  },
  {
    key: "resting_hr",
    name: "Resting heart rate",
    question: "How hard is my heart working at rest?",
    why: "Your lowest overnight pulse. Lower usually means fitter and more recovered; a sudden rise flags stress, alcohol or illness.",
    unit: "bpm",
    barMin: 35, barMax: 85, goodLo: 40, goodHi: 60,
    higherBetter: false,
    judge: (v) =>
      v < 60  ? j("good", "Excellent", `${Math.round(v)} bpm is an athletic resting pulse for your age.`)
      : v < 68 ? j("ok", "Okay", `${Math.round(v)} bpm is normal, though lower is better — watch the trend.`)
      : j("bad", "Elevated", `${Math.round(v)} bpm is high for a resting night — stress, late meals or illness can do this.`),
  },
  {
    key: "avg_hrv",
    name: "Heart-rate variability (HRV)",
    question: "How recovered is my nervous system?",
    why: "The tiny gaps between heartbeats vary more when you're relaxed and recovered. Higher (for you) = better. Compare against your own baseline, not other people's.",
    unit: "ms",
    barMin: 20, barMax: 120, goodLo: 50, goodHi: 120,
    higherBetter: true,
    judge: (v) =>
      v < 40  ? j("bad", "Low", `${Math.round(v)} ms suggests a stressed or under-recovered night.`)
      : v < 55 ? j("ok", "Moderate", `${Math.round(v)} ms is workable — watch whether it trends up or down.`)
      : j("good", "Strong", `${Math.round(v)} ms is a healthy recovery signal for a 20-year-old.`),
  },
  {
    key: "avg_breath",
    name: "Breathing rate",
    question: "Is my breathing normal at night?",
    why: "Breaths per minute while asleep. Very steady for each person — a jump of 2+ from your usual can be an early illness sign.",
    unit: "/min",
    barMin: 8, barMax: 24, goodLo: 12, goodHi: 20,
    higherBetter: null,
    judge: (v) => bandJudge(v, 12, 20, "/min",
      `${v.toFixed(1)}/min is on the slow side — usually harmless in fit sleepers.`,
      `${v.toFixed(1)}/min is a normal, steady night-time rate.`,
      `${v.toFixed(1)}/min is fast for sleep — worth watching if it stays up.`),
  },
  {
    key: "spo2_avg",
    name: "Blood oxygen",
    question: "Am I breathing well while asleep?",
    why: "Average oxygen saturation overnight. 95%+ is normal; consistently lower can mean restricted breathing.",
    unit: "%",
    barMin: 88, barMax: 100, goodLo: 95, goodHi: 100,
    higherBetter: true,
    judge: (v) =>
      v >= 95 ? j("good", "Normal", `${v.toFixed(1)}% — your breathing overnight looks healthy.`)
      : v >= 92 ? j("ok", "Slightly low", `${v.toFixed(1)}% is a little under the normal line — one-off nights are fine.`)
      : j("bad", "Low", `${v.toFixed(1)}% is low — if this repeats, it's worth mentioning to a doctor.`),
  },
];

export const TONE_COLOR: Record<Tone, string> = {
  good: "var(--green)",
  ok: "var(--yellow)",
  bad: "var(--red)",
};
