// Local, rule-based daily review. No AI / no network — pure functions over the
// data you already pulled, so it works offline forever and updates per night.
// General wellness guidance, not medical advice.

import { Night, fmtHrs } from "./data";

export type Tone = "good" | "warn" | "bad" | "info";
export type Obs = { tone: Tone; text: string };
export type Review = {
  headline: string;
  summary: string;
  observations: Obs[];
  tips: string[];
};

const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;

// bedtime as a continuous "night hour" so 00:39 reads as 24.65, not 0.65
function nightHour(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  let h = d.getHours() + d.getMinutes() / 60;
  if (h < 12) h += 24;
  return h;
}

function mean(xs: number[]) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

export function reviewForNight(night: Night, allNights: Night[]): Review {
  const total = night.total_sleep_h;
  const deepP = pct(night.deep_h, total);
  const remP = pct(night.rem_h, total);
  const awakeMin = night.awake_h * 60;
  const eff = night.efficiency ?? 0;
  const score = night.score;

  // personal baselines from the recent history (exclude this night)
  const recent = allNights.filter((n) => n.day !== night.day).slice(-14);
  const baseTotal = mean(recent.map((n) => n.total_sleep_h).filter(Boolean));
  const baseRhr = mean(recent.map((n) => n.lowest_hr ?? 0).filter(Boolean));
  const baseHrv = mean(recent.map((n) => n.avg_hrv ?? 0).filter(Boolean));

  const obs: Obs[] = [];
  const tips: string[] = [];

  // ---- duration ----
  if (total < 6) {
    obs.push({ tone: "bad", text: `Only ${fmtHrs(total)} asleep — well under the 7–9h most adults need.` });
    tips.push(`You're short on sleep. Aim to be in bed ${r0((7.5 - total) * 60)} min earlier tonight to head toward ~7.5h.`);
  } else if (total < 7) {
    obs.push({ tone: "warn", text: `${fmtHrs(total)} asleep — a little short of the 7–9h sweet spot.` });
    tips.push("Bring bedtime forward 20–30 min to nudge total sleep into the 7h+ range.");
  } else if (total <= 9) {
    obs.push({ tone: "good", text: `${fmtHrs(total)} asleep — right in the healthy 7–9h range.` });
  } else {
    obs.push({ tone: "info", text: `${fmtHrs(total)} asleep — long night; fine occasionally, but oversleeping can signal you're catching up or run down.` });
  }

  // ---- deep sleep ----
  if (total > 0) {
    if (deepP < 13) {
      obs.push({ tone: "warn", text: `Deep sleep was ${fmtHrs(night.deep_h)} (${r0(deepP)}%), below the usual 13–20%. Deep is your physical recovery.` });
      tips.push("Boost deep sleep: keep the room cool (~18°C), avoid alcohol within 3h of bed, and finish hard workouts earlier in the day.");
    } else if (deepP <= 22) {
      obs.push({ tone: "good", text: `Deep sleep ${fmtHrs(night.deep_h)} (${r0(deepP)}%) — solid physical recovery.` });
    }
    // ---- REM ----
    if (remP < 18) {
      obs.push({ tone: "warn", text: `REM was ${fmtHrs(night.rem_h)} (${r0(remP)}%), on the low side (typical 20–25%). REM handles memory and mood.` });
      tips.push("REM is hit hardest by late alcohol and caffeine, and by an inconsistent wake time — protect a steady morning alarm.");
    } else if (remP <= 27) {
      obs.push({ tone: "good", text: `REM ${fmtHrs(night.rem_h)} (${r0(remP)}%) — healthy for memory and mood.` });
    }
  }

  // ---- efficiency / restlessness ----
  if (eff && eff < 80) {
    obs.push({ tone: "bad", text: `Sleep efficiency ${r0(eff)}% — you spent ${fmtHrs(night.awake_h)} awake in bed.` });
    tips.push("Low efficiency: cut screens 30–60 min before bed, keep the room fully dark, and limit fluids late to reduce wake-ups.");
  } else if (eff && eff < 85) {
    obs.push({ tone: "warn", text: `Sleep efficiency ${r0(eff)}% — a bit restless (${r0(awakeMin)} min awake).` });
    tips.push("A consistent wind-down (dim lights, no screens 30 min before bed) and a dark, cool room usually push efficiency past 85%.");
  } else if (eff >= 88) {
    obs.push({ tone: "good", text: `Sleep efficiency ${r0(eff)}% — you fell and stayed asleep well.` });
  }

  // ---- recovery signals vs your own baseline ----
  if (night.lowest_hr && baseRhr && night.lowest_hr > baseRhr + 3) {
    obs.push({ tone: "warn", text: `Resting HR ${night.lowest_hr} bpm — above your ~${r0(baseRhr)} average. Often a sign of strain, late food, alcohol, or illness.` });
    tips.push("Elevated resting HR suggests incomplete recovery — favour a lighter day and an earlier night.");
  } else if (night.lowest_hr && baseRhr && night.lowest_hr <= baseRhr - 2) {
    obs.push({ tone: "good", text: `Resting HR ${night.lowest_hr} bpm — below your average. Strong recovery signal.` });
  }
  if (night.avg_hrv && baseHrv && night.avg_hrv < baseHrv * 0.85) {
    obs.push({ tone: "warn", text: `HRV ${r0(night.avg_hrv)} ms — under your ~${r0(baseHrv)} baseline, pointing to a more stressed/under-recovered night.` });
    tips.push("Low HRV often follows late meals, alcohol, or hard training — an easy day and an earlier night should help it rebound.");
  } else if (night.avg_hrv && baseHrv && night.avg_hrv > baseHrv * 1.1) {
    obs.push({ tone: "good", text: `HRV ${r0(night.avg_hrv)} ms — above baseline, a good recovery sign.` });
  }

  // ---- bedtime consistency (the biggest lever) ----
  // use the interquartile range, not max-min, so one odd night doesn't skew it
  const hours = [...recent, night]
    .map((n) => nightHour(n.bedtime_start))
    .filter((h): h is number => h != null)
    .sort((a, b) => a - b);
  if (hours.length >= 4) {
    const q = (p: number) => {
      const i = (hours.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
      return hours[lo] + (hours[hi] - hours[lo]) * (i - lo);
    };
    const iqr = q(0.75) - q(0.25);
    if (iqr > 1.5) {
      obs.push({ tone: "warn", text: `Your bedtime varied by about ${r1(iqr)}h across recent nights — irregular timing fragments sleep quality.` });
      tips.push("Consistency is the #1 lever: aim to sleep and wake within a ~30-min window every day, weekends included.");
    } else {
      obs.push({ tone: "good", text: `Bedtime has been fairly consistent (~${r1(iqr)}h variation) — great for your body clock.` });
    }
  }

  // ---- headline + summary ----
  const word = score == null ? "No score" : score >= 85 ? "a strong night" : score >= 70 ? "a solid night" : score >= 50 ? "a rough night" : "a poor night";
  const headline = score == null ? "Last night" : `Sleep score ${score} — ${word}`;
  const goodN = obs.filter((o) => o.tone === "good").length;
  const issueN = obs.filter((o) => o.tone === "warn" || o.tone === "bad").length;
  const summary =
    issueN === 0
      ? "Everything looks dialled in — keep doing what you're doing."
      : goodN >= issueN
        ? "Mostly good, with a couple of things worth tightening up below."
        : "A few things held this night back — the fixes below are where to focus.";

  // de-dupe + cap tips, always keep them actionable
  const uniqTips = [...new Set(tips)].slice(0, 4);
  if (uniqTips.length === 0) uniqTips.push("Hold your current routine — consistent timing and a cool, dark room are keeping this stable.");

  return { headline, summary, observations: obs.slice(0, 6), tips: uniqTips };
}
