import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";
import ts from "typescript";

const SOURCE_EXTENSION = /\.tsx?$/;
const IMPORT_EXTENSION = /\.(tsx?|jsx?)$/;

async function parseSource(path: string) {
  const text = await readFile(path, "utf8");
  return ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
}

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) {
        return sourceFiles(path);
      }
      return Promise.resolve(SOURCE_EXTENSION.test(entry.name) ? [path] : []);
    })
  );
  return nested.flat();
}

test("browser exercise loading imports only configuration and schemas", async () => {
  const source = await parseSource("app/exercises/client-loader.tsx");
  const targets: string[] = [];
  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const [target] = node.arguments;
      targets.push(
        ts.isTemplateExpression(target)
          ? (target.templateSpans.at(-1)?.literal.text ?? "")
          : target.getText(source)
      );
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.deepEqual(targets.sort(), [".config", ".schema"]);
});

test("full exercise loading is marked server-only and shared contracts are type-only", async () => {
  const server = await parseSource("app/exercises/loader.tsx");
  assert.ok(
    server.statements.some(
      (statement) =>
        ts.isImportDeclaration(statement) &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.moduleSpecifier.text === "server-only"
    )
  );
  const contracts = await parseSource("app/exercises/assets.ts");
  for (const statement of contracts.statements) {
    assert.ok(
      ts.isInterfaceDeclaration(statement) ||
        (ts.isImportDeclaration(statement) &&
          statement.importClause?.isTypeOnly),
      "Shared exercise contracts must not import database code or execute runtime logic"
    );
  }
});

test("client components cannot import or re-export the server exercise loader", async () => {
  const paths = (
    await Promise.all(["app", "components", "hooks"].map(sourceFiles))
  ).flat();
  const parsed = await Promise.all(paths.map(parseSource));
  const serverLoader = resolve("app/exercises/loader");
  for (const source of parsed) {
    const isClient = source.statements.some(
      (statement) =>
        ts.isExpressionStatement(statement) &&
        ts.isStringLiteral(statement.expression) &&
        statement.expression.text === "use client"
    );
    if (!isClient) {
      continue;
    }
    for (const statement of source.statements) {
      if (
        !(
          ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)
        )
      ) {
        continue;
      }
      const target = statement.moduleSpecifier;
      if (!(target && ts.isStringLiteral(target))) {
        continue;
      }
      if (
        ts.isImportDeclaration(statement) &&
        statement.importClause?.isTypeOnly
      ) {
        continue;
      }
      if (ts.isExportDeclaration(statement) && statement.isTypeOnly) {
        continue;
      }
      const specifier = target.text.replace(IMPORT_EXTENSION, "");
      const imported = specifier.startsWith("@/")
        ? resolve(specifier.slice(2))
        : resolve(source.fileName, "..", specifier);
      assert.notEqual(
        imported,
        serverLoader,
        `${source.fileName} must use the browser-safe exercise loader`
      );
    }
  }
});
