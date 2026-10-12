import { execFile, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { promisify } from "node:util";
import { appUrl, previewUrl } from "./environment";
import { previewBaseUrl } from "./preview-environment";

const exec = promisify(execFile);
const project = `neurogranada-e2e-${process.pid}`;
const password = randomBytes(24).toString("hex");
const env = {
  ...process.env,
  AI_GATEWAY_API_KEY: "",
  BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
  BETTER_AUTH_URL: appUrl,
  BLOB_READ_WRITE_TOKEN: "",
  CARTESIA_API_KEY: "",
  DATABASE_DRIVER: "postgres",
  E2E_DATABASE_PASSWORD: password,
  E2E_TOKEN: randomBytes(32).toString("hex"),
  NEUROGRANADA_E2E: "1",
  NEXT_PUBLIC_BLOB_URL: previewUrl,
  NEXT_TELEMETRY_DISABLED: "1",
  SANDBOX_EXERCISE: "",
  SANDBOX_EXERCISE_BASE64: "",
  SANDBOX_NAMESPACE: `e2e-${process.pid}`,
  SANDBOX_PREVIEW: "",
  SERPER_API_KEY: "",
  VERCEL_AUTOMATION_BYPASS_SECRET: "",
  VERCEL_ENV: "development",
  VERCEL_OIDC_TOKEN: "",
  VERCEL_TOKEN: "",
};
const composeArgs = [
  "compose",
  "-f",
  "tests/support/compose.yml",
  "-p",
  project,
];
const preview = createServer((_request, response) => {
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(
    "<!doctype html><html lang='es'><body><h1>Vista previa de prueba</h1></body></html>"
  );
});

async function runPlaywright(environment: NodeJS.ProcessEnv) {
  const child = spawn(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)],
    { env: environment, stdio: "inherit" }
  );
  const interrupt = () => child.kill("SIGINT");
  const terminate = () => child.kill("SIGTERM");
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", terminate);
  try {
    process.exitCode = await new Promise<number>((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code) => resolve(code ?? 1));
    });
  } finally {
    process.removeListener("SIGINT", interrupt);
    process.removeListener("SIGTERM", terminate);
  }
}

async function main() {
  if (previewBaseUrl()) {
    await runPlaywright(process.env);
    return;
  }
  try {
    await exec("docker", [...composeArgs, "up", "-d", "--wait"], { env });
    const { stdout } = await exec(
      "docker",
      [...composeArgs, "port", "postgres", "5432"],
      { env }
    );
    Object.assign(env, {
      DATABASE_URL: `postgresql://e2e:${password}@${stdout.trim()}/neurogranada_e2e`,
    });
    // Import only after the isolated connection is installed; never load developer .env.
    Object.assign(process.env, env);
    const { migrateTestDatabase } = await import("./database");
    await migrateTestDatabase();
    await new Promise<void>((resolve, reject) => {
      preview.once("error", reject);
      preview.listen(3101, "127.0.0.1", resolve);
    });
    await runPlaywright(env);
  } finally {
    preview.close();
    await exec("docker", [...composeArgs, "down", "--volumes"], { env });
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
