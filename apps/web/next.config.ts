import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@explainmotion/ai",
    "@explainmotion/assets",
    "@explainmotion/layout",
    "@explainmotion/renderer",
    "@explainmotion/schema",
    "@explainmotion/shared"
  ],
  // Keep native/Node-only backend deps out of the bundler (used in API route handlers).
  serverExternalPackages: ["pg", "bullmq", "ioredis", "drizzle-orm"]
};

export default nextConfig;
