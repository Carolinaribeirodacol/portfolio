import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Required for the Docker runtime image: bundles a minimal server into
  // .next/standalone instead of relying on a full `node_modules` + `next start`.
  output: "standalone",
};

export default nextConfig;
