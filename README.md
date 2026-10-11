# Oura Dashboard

A dashboard I built for my own Oura Ring data, because the official app tells you a number but not really what to do with it.

It pulls sleep, readiness and activity data and turns it into something you'd actually read: rings for the three daily scores, a full breakdown of last night's sleep with a zoomable hypnogram (drag across the deep sleep dip to see minute level heart rate and HRV), and a plain language explainer under every metric. Not just "HRV: 35ms" but what that number means for you specifically, compared against a healthy range and your own baseline. There's also a device check section that cross references Oura's numbers against a second wearable (Polar) on the same night, since I wanted to know how much to trust the ring on its own.

Live demo with sample data: https://bugscanfly.github.io/oura-dashboard/

Ships with representative sample data, so it runs and looks right straight out of the box. No ring, no account, no token needed. My actual data comes from a separate export script I run locally that never gets committed here.

## Stack

Next.js, React and TypeScript, styled with Tailwind. Charts are a mix of Chart.js and visx depending on what each one needed (the zoomable time series views wanted more control than Chart.js gives you), with `motion` handling the reveal animations.

## Running it

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Structure

```
app/                the page itself
components/          Recovery rings, sleep/readiness/activity sections, the chart library
lib/data.ts          types and helpers, mirrors what a Python export script pulls from Oura's API
lib/oura-data.json   the data the dashboard reads (sample data in this repo)
```
