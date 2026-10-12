import { spawn } from "node:child_process";
import { testCommands } from "./test-commands";

function run(args: string[]) {
  const child = spawn(process.execPath, args, { stdio: "inherit" });
  const interrupt = () => child.kill("SIGINT");
  const terminate = () => child.kill("SIGTERM");
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", terminate);
  return new Promise<number>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  }).finally(() => {
    process.removeListener("SIGINT", interrupt);
    process.removeListener("SIGTERM", terminate);
  });
}

async function main() {
  for (const command of testCommands(process.argv.slice(2))) {
    // biome-ignore lint/performance/noAwaitInLoops: fail fast and avoid overlapping browser/database suites
    const code = await run(command);
    if (code !== 0) {
      process.exitCode = code;
      return;
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
