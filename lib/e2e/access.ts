import { createHash, timingSafeEqual } from "node:crypto";
import { getSandboxNamespace } from "../sandbox-identity";

const headers = { "cache-control": "no-store" };

export function e2eResponse(body: unknown, status = 200) {
  return Response.json(body, { headers, status });
}

export function authorizeE2E(request: Request) {
  const token = process.env.E2E_TOKEN;
  let namespace: string;
  try {
    namespace = getSandboxNamespace();
  } catch {
    return e2eResponse({ error: "Not found" }, 404);
  }
  let database: URL;
  try {
    database = new URL(process.env.DATABASE_URL ?? "http://invalid");
  } catch {
    return e2eResponse({ error: "Not found" }, 404);
  }
  const local =
    process.env.NEUROGRANADA_E2E === "1" &&
    process.env.NODE_ENV !== "production" &&
    database.protocol === "postgresql:" &&
    database.hostname === "127.0.0.1" &&
    database.pathname === "/neurogranada_e2e" &&
    database.username === "e2e" &&
    namespace.startsWith("e2e-");
  const preview =
    process.env.VERCEL_ENV === "preview" && namespace.startsWith("preview-");
  if (
    process.env.VERCEL_ENV === "production" ||
    !(local || preview) ||
    !token ||
    token.length < 32
  ) {
    return e2eResponse({ error: "Not found" }, 404);
  }
  const authorization = request.headers.get("authorization") ?? "";
  if (authorization.length > 4096 || !authorization.startsWith("Bearer ")) {
    return e2eResponse({ error: "Unauthorized" }, 401);
  }
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (!timingSafeEqual(digest(authorization.slice(7)), digest(token))) {
    return e2eResponse({ error: "Unauthorized" }, 401);
  }
  return { namespace, token };
}
