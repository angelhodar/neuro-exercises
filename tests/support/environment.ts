export const appUrl = "http://127.0.0.1:3100";
export const previewUrl = "http://127.0.0.1:3101";

export function assertTestEnvironment() {
  const url = new URL(process.env.DATABASE_URL ?? "http://invalid");
  if (
    process.env.NEUROGRANADA_E2E !== "1" ||
    process.env.NODE_ENV === "production" ||
    url.protocol !== "postgresql:" ||
    url.hostname !== "127.0.0.1" ||
    url.pathname !== "/neurogranada_e2e" ||
    url.username !== "e2e" ||
    process.env.BETTER_AUTH_URL !== appUrl ||
    !process.env.SANDBOX_NAMESPACE?.startsWith("e2e-")
  ) {
    throw new Error("E2E adapters require the isolated local test environment");
  }
}
