import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "**",
        protocol: "https",
      },
    ],
  },
  reactCompiler: true,
  serverExternalPackages: ["@ai-sdk/harness-pi", "pi-mcp-adapter"],
};

export default withBotId(nextConfig);
