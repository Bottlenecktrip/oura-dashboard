"use client";
import "hammerjs";
import { useRef } from "react";
import { Line } from "react-chartjs-2";
import { ensureChart, zoomConfig } from "@/lib/registerChart";
import { C } from "@/lib/data";

ensureChart();

export type TrendSeries = {
  label: string;
  color: string;
  axis?: "y" | "y2";
  dashed?: boolean;
  points: { x: number; y: number | null }[];
};

export default function TrendChart({
  series, y2Label, unit = "", height = 260,
}: { series: TrendSeries[]; y2Label?: string; unit?: string; height?: number }) {
  const ref = useRef<any>(null);
  const usesY2 = series.some((s) => s.axis === "y2");

  const data: any = {
    datasets: series.map((s) => ({
      label: s.label,
      data: s.points,
      yAxisID: s.axis ?? "y",
      borderColor: s.color,
      backgroundColor: s.color,
      borderWidth: 2,
      borderDash: s.dashed ? [5, 4] : undefined,
      pointRadius: 2,
      pointHoverRadius: 4,
      tension: 0.3,
      spanGaps: false,
    })),
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        type: "time",
        time: { unit: "day", displayFormats: { day: "MMM d" }, tooltipFormat: "EEE, MMM d" },
        grid: { color: C.line },
        ticks: { color: C.faint, maxRotation: 0, autoSkipPadding: 20 },
      },
      y: {
        position: "left",
        grid: { color: C.line },
        ticks: { color: C.faint },
        title: unit ? { display: true, text: unit, color: C.faint } : undefined,
      },
      y2: {
        position: "right", display: usesY2,
        grid: { display: false },
        ticks: { color: C.faint },
        title: y2Label ? { display: true, text: y2Label, color: C.faint } : undefined,
      },
    },
    plugins: {
      legend: { labels: { color: C.dim, usePointStyle: true, boxWidth: 8, padding: 16 } },
      tooltip: {},
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
      <div style={{ height }}>
        <Line ref={ref} data={data} options={options} />
      </div>
    </div>
  );
}
