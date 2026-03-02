import { Sandbox } from "@vercel/sandbox";
import { deleteOldSnapshots, type SnapshotInfo } from "@/app/actions/snapshots";

const REPO_URL = "https://github.com/angelhodar/neuro-exercises.git";
const BRANCH = "main";
const LEADING_DOT_SLASH = /^\.\//;

async function copySandboxVariants(sandbox: Sandbox) {
  console.log("Discovering sandbox file variants...");
  const findResult = await sandbox.runCommand("find", [
    ".",
    "-name",
    "*.sandbox.ts",
    "-o",
    "-name",
    "*.sandbox.tsx",
  ]);
  const sandboxFiles = (await findResult.stdout())
    .split("\n")
    .map((f) => f.trim().replace(LEADING_DOT_SLASH, ""))
    .filter(Boolean);

  console.log(`Found ${sandboxFiles.length} sandbox files`);

  for (const src of sandboxFiles) {
    const dst = src.replace(".sandbox.", ".");
    await sandbox.runCommand("cp", [src, dst]);
    console.log(`  Copied ${src} -> ${dst}`);
  }
}

export async function createSnapshot(
  existingSandboxId?: string
): Promise<SnapshotInfo> {
  let sandbox: Sandbox;

  if (existingSandboxId) {
    console.log(`Connecting to existing sandbox ${existingSandboxId}...`);
    sandbox = await Sandbox.get({ sandboxId: existingSandboxId });

    if (sandbox.status !== "running") {
      throw new Error(
        `Sandbox is ${sandbox.status}. Stopped sandboxes cannot be restarted.`
      );
    }

    console.log(`Connected (status: ${sandbox.status})`);
  } else {
    console.log("Creating sandbox from git repo...");
    sandbox = await Sandbox.create({
      source: { type: "git", url: REPO_URL, revision: BRANCH },
      runtime: "node24",
      ports: [3000],
      timeout: 600_000,
    });
    console.log(`Sandbox created: ${sandbox.sandboxId}`);

    console.log("Installing dependencies...");
    const installResult = await sandbox.runCommand("npm", ["ci"]);
    console.log(`npm ci stdout:\n${await installResult.stdout()}`);
  }

  await copySandboxVariants(sandbox);

  console.log("Creating snapshot...");
  const snap = await sandbox.snapshot();
  console.log(`Snapshot created: ${snap.snapshotId}`);

  const snapshotInfo: SnapshotInfo = {
    snapshotId: snap.snapshotId,
    expiresAt: snap.expiresAt,
  };

  // Clean up old snapshots
  await deleteOldSnapshots(snap.snapshotId);

  return snapshotInfo;
}
