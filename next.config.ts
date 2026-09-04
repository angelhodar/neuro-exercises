import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

// Exercise preview sandboxes set SANDBOX_PREVIEW=1 in their .env (see
// lib/ai/exercise-workspace.ts) before the dev server starts.
const isSandboxPreview = process.env.SANDBOX_PREVIEW === "1";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.vercel.run"],
  ...(isSandboxPreview ? { devIndicators: false as const } : {}),
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
