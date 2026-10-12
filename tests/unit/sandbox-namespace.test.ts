import assert from "node:assert/strict";
import { test } from "node:test";
import { authorizeE2E } from "../../lib/e2e/access";
import {
  assertWorkspaceIdentity,
  getSandboxNamespace,
  getWorkspaceIdentity,
} from "../../lib/sandbox-identity";

const DERIVED_NAMESPACE = /^preview-[a-f0-9]{16}$/;
const MISSING_METADATA = /requires VERCEL_PROJECT_ID/;
const INVALID_NAMESPACE = /SANDBOX_NAMESPACE/;

function previewEnvironment(t: { after: (callback: () => void) => void }) {
  const original = process.env;
  process.env = {
    ...original,
    SANDBOX_NAMESPACE: "",
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_REF: "feature/authoring",
    VERCEL_PROJECT_ID: "prj-test",
  };
  t.after(() => {
    process.env = original;
  });
}

test("preview namespace is bounded and stable across redeployments and PR creation", (t) => {
  previewEnvironment(t);
  const namespace = getSandboxNamespace();
  assert.match(namespace, DERIVED_NAMESPACE);
  assert.equal(namespace.length, 24);
  const workspace = getWorkspaceIdentity(1);
  process.env.VERCEL_DEPLOYMENT_ID = "dpl-new";
  process.env.VERCEL_URL = "new-deployment.vercel.app";
  process.env.VERCEL_GIT_COMMIT_SHA = "new-sha";
  process.env.VERCEL_GIT_PULL_REQUEST_ID = "42";
  assert.equal(getSandboxNamespace(), namespace);
  assert.deepEqual(assertWorkspaceIdentity(workspace, 1), workspace);
});

test("preview namespaces distinguish projects and exact branch names", (t) => {
  previewEnvironment(t);
  const namespaces = new Set<string>();
  for (const project of ["prj-test", "prj-other"]) {
    for (const branch of [
      "feature/authoring",
      "feature-authoring",
      "Feature/authoring",
    ]) {
      process.env.VERCEL_PROJECT_ID = project;
      process.env.VERCEL_GIT_COMMIT_REF = branch;
      namespaces.add(getSandboxNamespace());
    }
  }
  assert.equal(namespaces.size, 6);
});

test("preview derivation fails closed when metadata is missing", (t) => {
  previewEnvironment(t);
  for (const key of ["VERCEL_PROJECT_ID", "VERCEL_GIT_COMMIT_REF"]) {
    const original = process.env[key];
    for (const value of [undefined, "", " "]) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
      assert.throws(getSandboxNamespace, MISSING_METADATA);
    }
    process.env[key] = original;
  }
});

test("explicit namespaces retain validation and non-preview environments require them", (t) => {
  previewEnvironment(t);
  process.env.SANDBOX_NAMESPACE = "preview-existing";
  assert.equal(getSandboxNamespace(), "preview-existing");
  assert.throws(
    () => getSandboxNamespace("Invalid Namespace"),
    INVALID_NAMESPACE
  );
  for (const environment of ["production", "development", ""]) {
    process.env.VERCEL_ENV = environment;
    process.env.SANDBOX_NAMESPACE = "";
    assert.throws(getSandboxNamespace, INVALID_NAMESPACE);
    process.env.SANDBOX_NAMESPACE = "fixed-environment";
    assert.equal(getSandboxNamespace(), "fixed-environment");
  }
});

test("fixture authorization accepts an automatically derived preview namespace", (t) => {
  previewEnvironment(t);
  const token = "synthetic-preview-token-at-least-32-characters";
  process.env.E2E_TOKEN = token;
  process.env.DATABASE_URL = "postgresql://test:test@localhost/test";
  const access = authorizeE2E(
    new Request("https://preview.example/api/e2e/setup", {
      headers: { authorization: `Bearer ${token}` },
    })
  );
  assert.ok(!(access instanceof Response));
  assert.equal(access.namespace, getSandboxNamespace());
});
