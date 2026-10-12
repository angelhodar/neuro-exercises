import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";
import { assertTestEnvironment } from "./tests/support/environment";

const isE2E = process.env.NEUROGRANADA_E2E === "1";
if (isE2E) {
  assertTestEnvironment();
}

// Exercise preview sandboxes set SANDBOX_PREVIEW=1 in their .env (see
// lib/ai/exercise-workspace.ts) before the dev server starts.
const isSandboxPreview = process.env.SANDBOX_PREVIEW === "1";

const nextConfig: NextConfig = {
  ...(isE2E
    ? {
        distDir: ".next-e2e",
        turbopack: {
          resolveAlias: {
            "@/lib/ai/agent/agent":
              "./tests/support/services/implementation-agent.ts",
            "@/lib/ai/exercise-checkpoint":
              "./tests/support/services/checkpoint.ts",
            "@/lib/ai/exercise-metadata":
              "./tests/support/services/exercise-metadata.ts",
            "@/lib/ai/exercise-workspace":
              "./tests/support/services/sandbox.ts",
            "@/lib/ai/refinement/model":
              "./tests/support/services/refinement-model.ts",
            "@ai-sdk/sandbox-vercel":
              "./tests/support/services/sandbox-session.ts",
          },
        },
      }
    : {}),
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
