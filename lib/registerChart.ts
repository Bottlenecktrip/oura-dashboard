"use client";
// Register Chart.js pieces + the zoom/pan plugin once, on the client.
import {
  Chart as ChartJS,
  LineElement, PointElement, BarElement,
  LinearScale, TimeScale, CategoryScale,
  Filler, Tooltip, Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";

let registered = false;

export function ensureChart() {
  if (registered) return;
  ChartJS.register(
    LineElement, PointElement, BarElement,
    LinearScale, TimeScale, CategoryScale,
    Filler, Tooltip, Legend, zoomPlugin,
  );
  ChartJS.defaults.color = "#9aa3b2";
  ChartJS.defaults.font.family =
    "Inter, Roboto, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif";
  registered = true;
}

// shared zoom/pan config (drag-to-zoom on desktop, pinch on mobile, wheel, pan)
export const zoomConfig = {
  zoom: {
    wheel: { enabled: true, speed: 0.08 },
    pinch: { enabled: true },
    drag: {
      enabled: true,
      backgroundColor: "rgba(255,255,255,0.10)",
      borderColor: "rgba(255,255,255,0.4)",
      borderWidth: 1,
    },
    mode: "x" as const,
  },
  pan: { enabled: true, mode: "x" as const, modifierKey: "shift" as const },
};
