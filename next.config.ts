import type { NextConfig } from "next";

// Static export so the dashboard can be hosted on GitHub Pages.
const onPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: onPages ? "/oura-dashboard" : "",
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
