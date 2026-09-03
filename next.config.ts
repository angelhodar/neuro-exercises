import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.vercel.run"],
  images: {
    remotePatterns: [
      {
        hostname: "**",
        protocol: "https",
      },
    ],
  },
  reactCompiler: true,
  serverExternalPackages: [
    "@ai-sdk/harness-pi",
    "@electric-sql/pglite",
    "pi-mcp-adapter",
  ],
};

export default withBotId(nextConfig);
