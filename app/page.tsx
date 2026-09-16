import SleepHero from "@/components/SleepHero";
import ReadinessSection from "@/components/ReadinessSection";
import ActivitySection from "@/components/ActivitySection";
import AgreementStrip from "@/components/AgreementStrip";
import AtAGlance from "@/components/AtAGlance";
import KeyNumbers from "@/components/KeyNumbers";
import { data, fmtDay } from "@/lib/data";

export default function Home() {
  const { age, sex } = data.profile;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
      <header className="mb-5 sm:mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Recovery</h1>
          <div className="faint text-xs">
            {fmtDay(data.range.start)} – {fmtDay(data.range.end)} · Oura
            {age ? ` · ${age}${sex ? " " + sex : ""}` : ""}
          </div>
        </div>
      </header>

      <AgreementStrip />

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
        <AtAGlance />
        <KeyNumbers />
        <SleepHero />
        <ReadinessSection />
        <ActivitySection />
      </div>

      <footer className="faint text-xs mt-8 text-center">
        Built from your own Oura data · generated {data.generated} · runs locally, no token in this app.
      </footer>
    </main>
  );
}
