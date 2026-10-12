import { globSync } from "node:fs";
import { relative, resolve } from "node:path";

const suites = ["unit", "integration", "e2e"] as const;
type Suite = (typeof suites)[number];

function suiteCommand(suite: Suite, args: string[] = []) {
  if (suite === "e2e") {
    return ["--import", "tsx", "tests/support/run-e2e.ts", ...args];
  }
  const files = args.some((arg) => arg.endsWith(".test.ts"))
    ? []
    : globSync(`tests/${suite}/*.test.ts`).sort();
  return ["--import", "tsx", "--test", ...args, ...files];
}

export function testCommands(args: string[]) {
  if (args.length === 0) {
    return suites.map((suite) => suiteCommand(suite));
  }
  const selectedSuite = suites.find((name) => name === args[0]);
  if (selectedSuite) {
    return [suiteCommand(selectedSuite, args.slice(1))];
  }

  const files = args.flatMap((pattern) => {
    const matches = globSync(pattern);
    if (matches.length === 0) {
      throw new Error(`No test files match ${pattern}`);
    }
    return matches.map((file) => relative(process.cwd(), resolve(file)));
  });
  for (const file of files) {
    const isNodeTest =
      (file.startsWith("tests/unit/") ||
        file.startsWith("tests/integration/")) &&
      file.endsWith(".test.ts");
    const isBrowserTest =
      file.startsWith("tests/e2e/") && file.endsWith(".spec.ts");
    if (!(isNodeTest || isBrowserTest)) {
      throw new Error(`Not an application test file: ${file}`);
    }
  }
  return suites.flatMap((name) => {
    const selected = [
      ...new Set(files.filter((file) => file.startsWith(`tests/${name}/`))),
    ];
    return selected.length > 0 ? [suiteCommand(name, selected)] : [];
  });
}
