"use client";
import { Bar } from "react-chartjs-2";
import { ensureChart } from "@/lib/registerChart";
import { C, fmtDay, type HRZone } from "@/lib/data";

ensureChart();

const ZONES = [
  { key: "z1", label: "Zone 1 · Very light", color: "#2f9e44" },
  { key: "z2", label: "Zone 2 · Light", color: "#74b816" },
  { key: "z3", label: "Zone 3 · Moderate", color: "#f59f00" },
  { key: "z4", label: "Zone 4 · Hard", color: "#f76707" },
  { key: "z5", label: "Zone 5 · Max", color: "#e03131" },
] as const;

export default function ZoneChart({ zones }: { zones: HRZone[] }) {
  const labels = zones.map((z) => fmtDay(z.day));
  const data: any = {
    labels,
    datasets: ZONES.map((z) => ({
      label: z.label,
      data: zones.map((d) => (d as any)[z.key]),
      backgroundColor: z.color,
      borderRadius: 3,
      stack: "hr",
      barThickness: "flex",
      maxBarThickness: 46,
    })),
  };
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: C.faint, maxRotation: 0 } },
      y: {
        stacked: true, grid: { color: C.line },
        ticks: { color: C.faint, callback: (v: number) => `${v}m` },
        title: { display: true, text: "minutes", color: C.faint },
      },
    },
    plugins: {
      legend: { labels: { color: C.dim, usePointStyle: true, boxWidth: 8, padding: 12 } },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y} min` } },
    },
  };
  return (
    <div style={{ height: 300 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
