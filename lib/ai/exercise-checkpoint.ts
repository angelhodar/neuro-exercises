import type { Sandbox } from "@vercel/sandbox";
import { SANDBOX_PROJECT_DIR } from "@/lib/sandbox";
import { uploadBlob } from "@/lib/storage";
import { createZipBuffer } from "@/lib/zip";

const ALLOWED_FILE = /\.(?:json|md|ts|tsx)$/;
const MAX_FILE_COUNT = 50;
const MAX_TOTAL_BYTES = 2 * 1024 * 1024;
const RELATIVE_PATH_PREFIX = /^\.\//;

interface ExerciseFile {
  content: string;
  path: string;
}

function exerciseDirectory(slug: string) {
  return `app/exercises/${slug}`;
}

function requiredPaths(slug: string) {
  const directory = exerciseDirectory(slug);
  return [
    `${directory}/${slug}.config.tsx`,
    `${directory}/${slug}.exercise.tsx`,
    `${directory}/${slug}.results.tsx`,
    `${directory}/${slug}.schema.ts`,
  ];
}

async function collectExerciseFiles(sandbox: Sandbox, slug: string) {
  const directory = exerciseDirectory(slug);
  const symlinks = await sandbox.runCommand({
    args: [directory, "-type", "l", "-print"],
    cmd: "find",
    cwd: SANDBOX_PROJECT_DIR,
  });

  if ((await symlinks.stdout()).trim()) {
    throw new Error("El ejercicio no puede contener enlaces simbólicos");
  }

  const result = await sandbox.runCommand({
    args: [directory, "-type", "f", "-print"],
    cmd: "find",
    cwd: SANDBOX_PROJECT_DIR,
  });

  if (result.exitCode !== 0) {
    throw new Error("No se encontró la carpeta del ejercicio");
  }

  const paths = (await result.stdout())
    .split("\n")
    .map((path) => path.trim().replace(RELATIVE_PATH_PREFIX, ""))
    .filter(Boolean)
    .sort();

  if (paths.length > MAX_FILE_COUNT) {
    throw new Error(
      `El ejercicio supera el límite de ${MAX_FILE_COUNT} archivos`
    );
  }

  const prefix = `${directory}/`;
  const invalidPath = paths.find(
    (path) =>
      !path.startsWith(prefix) ||
      path.includes("..") ||
      path.includes("\\") ||
      !ALLOWED_FILE.test(path)
  );

  if (invalidPath) {
    throw new Error(`Ruta de archivo no permitida: ${invalidPath}`);
  }

  const missingPath = requiredPaths(slug).find((path) => !paths.includes(path));
  if (missingPath) {
    throw new Error(`Falta el archivo requerido: ${missingPath}`);
  }

  const files = await Promise.all(
    paths.map(async (path): Promise<ExerciseFile> => {
      const content = await sandbox.readFileToBuffer({
        path: `${SANDBOX_PROJECT_DIR}/${path}`,
      });

      if (!content) {
        throw new Error(`No se pudo leer ${path}`);
      }

      return { content: content.toString("utf8"), path };
    })
  );

  const totalBytes = files.reduce(
    (total, file) => total + Buffer.byteLength(file.content),
    0
  );
  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new Error("El ejercicio supera el límite de tamaño permitido");
  }

  return files;
}

async function verifyExercise(sandbox: Sandbox, slug: string) {
  const directory = exerciseDirectory(slug);
  const typecheck = await sandbox.runCommand({
    args: ["run", "ts-check"],
    cmd: "npm",
    cwd: SANDBOX_PROJECT_DIR,
  });

  if (typecheck.exitCode !== 0) {
    const output = (await typecheck.stderr()) || (await typecheck.stdout());
    throw new Error(
      `La comprobación de tipos falló:\n${output.slice(0, 5000)}`
    );
  }

  const lint = await sandbox.runCommand({
    args: ["run", "check", "--", directory],
    cmd: "npm",
    cwd: SANDBOX_PROJECT_DIR,
  });

  if (lint.exitCode !== 0) {
    const output = (await lint.stderr()) || (await lint.stdout());
    throw new Error(
      `La comprobación de formato falló:\n${output.slice(0, 5000)}`
    );
  }
}

export async function createExerciseCheckpoint(sandbox: Sandbox, slug: string) {
  const files = await collectExerciseFiles(sandbox, slug);
  await verifyExercise(sandbox, slug);
  const zip = createZipBuffer(files);
  const blob = await uploadBlob(`generations/${crypto.randomUUID()}.zip`, zip);
  return blob.pathname;
}
