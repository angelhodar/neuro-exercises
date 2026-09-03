import { Sandbox } from "@vercel/sandbox";
import type { SnapshotInfo } from "@/app/actions/snapshots";

const REPO_URL = "https://github.com/angelhodar/neuro-exercises.git";
const BRANCH = "main";
const LEADING_DOT_SLASH = /^\.\//;
export const SANDBOX_PROJECT_DIR = "/vercel/neuro-exercises";

export function getBaseSandboxName() {
  const revision = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? BRANCH;
  return `exercise-base-${revision}`;
}

async function copySandboxVariants(sandbox: Sandbox) {
  console.log("Discovering sandbox file variants...");
  const findResult = await sandbox.runCommand({
    args: [".", "-name", "*.sandbox.ts", "-o", "-name", "*.sandbox.tsx"],
    cmd: "find",
    cwd: SANDBOX_PROJECT_DIR,
  });
  const sandboxFiles = (await findResult.stdout())
    .split("\n")
    .map((f) => f.trim().replace(LEADING_DOT_SLASH, ""))
    .filter(Boolean);

  console.log(`Found ${sandboxFiles.length} sandbox files`);

  await Promise.all(
    sandboxFiles.map(async (src) => {
      const dst = src.replace(".sandbox.", ".");
      await sandbox.runCommand({
        args: [src, dst],
        cmd: "cp",
        cwd: SANDBOX_PROJECT_DIR,
      });
      console.log(`  Copied ${src} -> ${dst}`);
    })
  );
}

export async function createSnapshot(
  existingSandboxName?: string
): Promise<SnapshotInfo> {
  let sandbox: Sandbox;

  if (existingSandboxName) {
    console.log(`Connecting to existing sandbox ${existingSandboxName}...`);
    sandbox = await Sandbox.get({ name: existingSandboxName });

    console.log(`Connected (status: ${sandbox.status})`);
  } else {
    console.log("Creating sandbox from git repo...");
    sandbox = await Sandbox.getOrCreate({
      image: "vercel/sandbox/node:24",
      name: getBaseSandboxName(),
      persistent: true,
      ports: [3000],
      source: { revision: BRANCH, type: "git", url: REPO_URL },
      timeout: 600_000,
    });
    console.log(`Sandbox created: ${sandbox.name}`);
  }

  console.log("Installing dependencies...");
  const installResult = await sandbox.runCommand({
    args: ["ci"],
    cmd: "npm",
    cwd: SANDBOX_PROJECT_DIR,
  });
  const installOutput =
    (await installResult.stderr()) || (await installResult.stdout());
  if (installResult.exitCode !== 0) {
    throw new Error(`No se pudieron instalar dependencias:\n${installOutput}`);
  }
  console.log(`npm ci output:\n${installOutput}`);

  await copySandboxVariants(sandbox);

  console.log("Creating snapshot...");
  const snap = await sandbox.snapshot();
  console.log(`Snapshot created: ${snap.snapshotId}`);

  return {
    expiresAt: snap.expiresAt,
    snapshotId: snap.snapshotId,
  };
}
