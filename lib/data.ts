import raw from "./oura-data.json";

// ---- types (mirror export_detailed.py output) ----
export type Stage = "deep" | "light" | "rem" | "awake";
export type StagePoint = { t: string; stage: Stage };
export type SeriesPoint = { t: string; v: number };

export type Night = {
  day: string;
  score: number | null;
  score_contributors: Record<string, number>;
  bedtime_start: string | null;
  bedtime_end: string | null;
  total_sleep_h: number;
  time_in_bed_h: number;
  efficiency: number | null;
  deep_h: number;
  rem_h: number;
  light_h: number;
  awake_h: number;
  lowest_hr: number | null;
  avg_hr: number | null;
  avg_hrv: number | null;
  avg_breath: number | null;
  hypnogram: StagePoint[];
  hr: SeriesPoint[];
  hrv: SeriesPoint[];
};
export type Readiness = {
  day: string;
  score: number | null;
  temperature_deviation: number | null;
  contributors: Record<string, number>;
};
export type Activity = {
  day: string; score: number | null; steps: number | null;
  active_cal: number | null; total_cal: number | null;
  high_min: number; medium_min: number; low_min: number; sedentary_min: number;
  inactivity_alerts: number | null;
};
export type HRZone = { day: string; z1: number; z2: number; z3: number; z4: number; z5: number };
export type Workout = {
  day: string; activity: string | null; intensity: string | null;
  calories: number | null; distance_m: number | null; start: string | null; end: string | null;
};
export type OuraData = {
  generated: string; range: { start: string; end: string }; max_hr: number;
  profile: { age: number | null; sex: string | null };
  nights: Night[]; readiness: Readiness[]; activity: Activity[];
  hr_zones: HRZone[]; workouts: Workout[];
};

export const data = raw as unknown as OuraData;

// ---- Whoop-style palette (hex; canvas can't read CSS vars) ----
export const C = {
  green: "#19e08a", yellow: "#ffcf5c", orange: "#ff9f43", red: "#ff5a5f",
  deep: "#3b5bdb", light: "#4dabf7", rem: "#9775fa", awake: "#ff8787",
  hr: "#ff6b6b", hrv: "#38d9a9",
  txt: "#ffffff", dim: "#9aa3b2", faint: "#5b6472",
  line: "rgba(255,255,255,0.07)", card: "#0e1014", bg: "#000000",
};

// stage <-> vertical level (awake on top, deep at bottom)
export const STAGE_ORDER: Stage[] = ["deep", "light", "rem", "awake"];
export const stageLevel = (s: Stage) => STAGE_ORDER.indexOf(s);
export const STAGE_COLOR: Record<Stage, string> = {
  deep: C.deep, light: C.light, rem: C.rem, awake: C.awake,
};
export const levelColor = (lvl: number) => STAGE_COLOR[STAGE_ORDER[lvl] ?? "light"];

// ---- helpers ----
export const fmtHrs = (h: number | null | undefined) =>
  h == null ? "—" : `${Math.floor(h)}h ${Math.round((h % 1) * 60).toString().padStart(2, "0")}m`;

export const fmtDay = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

export const fmtClock = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "—";

export function scoreColor(v: number | null | undefined): string {
  if (v == null) return C.faint;
  if (v >= 85) return C.green;
  if (v >= 70) return C.yellow;
  return C.red;
}
export function scoreWord(v: number | null | undefined): string {
  if (v == null) return "No data";
  if (v >= 85) return "Optimal";
  if (v >= 70) return "Good";
  if (v >= 50) return "Fair";
  return "Pay attention";
}

export const latest = <T,>(arr: T[]): T | undefined => arr[arr.length - 1];
export const round = (v: number | null | undefined, d = 0) =>
  v == null ? null : Math.round(v * 10 ** d) / 10 ** d;
