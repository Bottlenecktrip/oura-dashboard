import { Review, Tone } from "@/lib/insights";

const DOT: Record<Tone, string> = {
  good: "var(--green)",
  warn: "var(--yellow)",
  bad: "var(--red)",
  info: "var(--dim)",
};

export default function DailyReview({ review }: { review: Review }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="eyebrow">Daily review</span>
      </div>
      <h3 className="text-lg font-semibold mt-1">{review.headline}</h3>
      <p className="dim text-sm mt-1">{review.summary}</p>

      <ul className="mt-4 space-y-2">
        {review.observations.map((o, i) => (
          <li key={i} className="flex gap-2.5 text-sm">
            <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: DOT[o.tone] }} />
            <span>{o.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="eyebrow mb-2">How to improve</div>
        <ul className="space-y-2">
          {review.tips.map((t, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              <span className="shrink-0" style={{ color: "var(--green)" }}>→</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="faint text-[11px] mt-4">
        Auto-generated from your data each day · general wellness guidance, not medical advice.
      </p>
    </div>
  );
}
