import { loadEnvFile } from "node:process";

try {
  loadEnvFile();
} catch (error) {
  // Deployments can provide environment variables without a local .env file.
  if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
    throw error;
  }
}
