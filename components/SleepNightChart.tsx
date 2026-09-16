"use client";
import "hammerjs"; // enables pinch-zoom on touch devices
import { useRef } from "react";
import { Line } from "react-chartjs-2";
import { ensureChart, zoomConfig } from "@/lib/registerChart";
import { C, levelColor, stageLevel, type Night } from "@/lib/data";

ensureChart();

const STAGE_NAMES = ["Deep", "Light", "REM", "Awake"];

export default function SleepNightChart({ night }: { night: Night }) {
  const ref = useRef<any>(null);

  const toXY = (arr: { t: string; v: number }[]) =>
    arr.map((p) => ({ x: new Date(p.t).getTime(), y: p.v }));
  const stageXY = night.hypnogram.map((p) => ({ x: new Date(p.t).getTime(), y: stageLevel(p.stage) }));

  const data: any = {
    datasets: [
      {
        label: "Stage",
        data: stageXY,
        yAxisID: "stage",
        stepped: "before",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        backgroundColor: "rgba(120,140,255,0.06)",
        borderColor: C.light,
        segment: { borderColor: (ctx: any) => levelColor(ctx.p1.parsed.y) },
        order: 3,
      },
      {
        label: "Heart rate",
        data: toXY(night.hr),
        yAxisID: "hr",
        borderColor: C.hr,
        borderWidth: 1.6,
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.35,
        order: 1,
      },
      {
        label: "HRV",
        data: toXY(night.hrv),
        yAxisID: "hrv",
        borderColor: C.hrv,
        borderWidth: 1.4,
        borderDash: [4, 3],
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.35,
        order: 2,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        type: "time",
        time: { unit: "hour", displayFormats: { hour: "HH:mm" }, tooltipFormat: "HH:mm" },
        grid: { color: C.line },
        ticks: { color: C.faint, maxRotation: 0, autoSkipPadding: 24 },
      },
      stage: {
        type: "linear", position: "left", min: -0.35, max: 3.35,
        grid: { color: C.line },
        ticks: { stepSize: 1, color: C.dim, callback: (v: number) => STAGE_NAMES[v] ?? "" },
      },
      hr: {
        type: "linear", position: "right", suggestedMin: 40,
        grid: { display: false },
        ticks: { color: C.faint },
        title: { display: true, text: "bpm", color: C.faint },
      },
      hrv: { type: "linear", position: "right", display: false },
    },
    plugins: {
      legend: { labels: { color: C.dim, usePointStyle: true, boxWidth: 8, padding: 16 } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            if (ctx.dataset.yAxisID === "stage") return `Stage: ${STAGE_NAMES[ctx.parsed.y] ?? ""}`;
            const u = ctx.dataset.yAxisID === "hrv" ? " ms" : " bpm";
            return `${ctx.dataset.label}: ${Math.round(ctx.parsed.y)}${u}`;
          },
        },
      },
      zoom: zoomConfig,
    },
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-1">
        <button
          onClick={() => ref.current?.resetZoom()}
          className="text-[11px] dim hover:text-white border border-white/10 rounded-full px-2.5 py-1 transition-colors"
        >
          Reset zoom
        </button>
      </div>
      <div style={{ height: 320 }}>
        <Line ref={ref} data={data} options={options} />
      </div>
    </div>
  );
}
